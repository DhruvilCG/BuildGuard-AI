import * as db from "../config/db.js";
import axios from "axios";

export const updateStock = async (req, res) => {
  try {
    const { site_id, item_name, quantity, unit, threshold } = req.body;

    const result = await db.query(
      `INSERT INTO inventory (site_id, item_name, quantity, unit, threshold)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (site_id, item_name) 
    DO UPDATE SET 
      quantity = EXCLUDED.quantity, 
      updated_at = CURRENT_TIMESTAMP
    RETURNING *`,
      [site_id, item_name, quantity, unit, threshold]
    );

    const item = result.rows[0];
    let alertSent = false;
    let alertMessage = "Stock updated successfully.";

    // --- ALERT LOGIC START ---
    if (parseFloat(item.quantity) <= parseFloat(item.threshold)) {
      const contacts = await db.query(
        `SELECT 
            s.site_name,
            m.full_name as mgr_name, m.phone_number as mgr_phone,
            a.full_name as adm_name, a.phone_number as adm_phone
         FROM sites s
         LEFT JOIN users m ON s.manager_id = m.id
         LEFT JOIN users a ON s.admin_id = a.id
         WHERE s.id = $1`,
        [site_id]
      );

      const vendorResult = await db.query(
        `SELECT vendor_name, vendor_email, vendor_phone 
         FROM vendors 
         WHERE item_name = $1 LIMIT 1`,
        [item_name]
      );

      const vendor = vendorResult.rows[0] || {
        vendor_name: "No Vendor Assigned",
        vendor_email: "admin@buildguard.com",
        vendor_phone: "N/A",
      };

      if (contacts.rows.length > 0) {
        const info = contacts.rows[0];

        // NEW: Backend se hi Approval Link banayein taaki n8n mein error na aaye [cite: 2025-12-16]
        const approvalBaseUrl =
          process.env.N8N_APPROVAL_URL ||
          "https://uncandied-bernie-finny.ngrok-free.dev/webhook/approve";

        const approvalLink = `${approvalBaseUrl}?site=${encodeURIComponent(
          info.site_name
        )}&item=${encodeURIComponent(
          item_name
        )}&qty=${quantity}&unit=${unit}&vendor_name=${encodeURIComponent(
          vendor.vendor_name
        )}&vendor_email=${encodeURIComponent(
          vendor.vendor_email
        )}&manager_name=${encodeURIComponent(
          info.mgr_name
        )}&manager_phone=${encodeURIComponent(info.mgr_phone)}`;

        
        alertSent = true;
        alertMessage = `⚠️ LOW STOCK ALERT: ${item_name} is below threshold at ${info.site_name}. Notification sent!`;

        if (process.env.N8N_WEBHOOK_URL) {
          try {
            // n8n ko approval_url ke saath saara data bhej rahe hain [cite: 2025-12-16]
            await axios.post(process.env.N8N_WEBHOOK_URL, {
              site: info.site_name,
              item: item_name,
              qty: quantity,
              unit: unit,
              manager: { name: info.mgr_name, phone: info.mgr_phone },
              admin: { name: info.adm_name, phone: info.adm_phone },
              vendor: {
                name: vendor.vendor_name,
                email: vendor.vendor_email,
                phone: vendor.vendor_phone,
              },
              approval_url: approvalLink,
            });
            console.log("✅ Webhook triggered with Approval Link");
          } catch (e) {
            console.error("❌ Webhook failed", e.message);
          }
        }
      }
    }

    res.status(201).json({
      message: alertMessage,
      is_low_stock: alertSent,
      data: item,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Inventory update failed" });
  }
};

// ... baki functions same rahenge

// Kisi specific site ka pura inventory dekhne ke liye
export const getInventoryBySite = async (req, res) => {
  try {
    const { site_id } = req.params;

    const result = await db.query(
      "SELECT * FROM inventory WHERE site_id = $1",
      [site_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};


/**
 * Human-in-the-Loop: AI data ko verify karke Final Inventory mein dalna
 */
export const approveRawInput = async (req, res) => {
  // Transaction ke liye pool use karna zaroori hai
  const client = await db.pool.connect(); 
  
  try {
    const { raw_input_id, corrected_items } = req.body; 
    const user_id = req.user?.id || null;

    await client.query('BEGIN');

    // 1. Fetch AI extracted data
    const rawInputResult = await client.query(
      `SELECT * FROM raw_inputs WHERE id = $1 AND status = 'PENDING'`,
      [raw_input_id]
    );

    if (rawInputResult.rows.length === 0) {
      throw new Error("Bill not found or already processed.");
    }

    const rawData = rawInputResult.rows[0];
    const site_id = rawData.site_id;
    
    // HITL: Agar manager ne manually correct kiya hai toh wo use karo, nahi toh AI wala
    const itemsToProcess = corrected_items || rawData.extracted_data.items;

    // 2. Loop through items and update Inventory
    for (const item of itemsToProcess) {
      // A. Update/Insert Inventory (INCREMENT Logic)
      const invUpdate = await client.query(
        `INSERT INTO inventory (site_id, item_name, quantity, unit)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (site_id, item_name) 
         DO UPDATE SET 
            quantity = inventory.quantity + EXCLUDED.quantity, 
            updated_at = CURRENT_TIMESTAMP
         RETURNING id, quantity, threshold`,
        [site_id, item.item_name, item.quantity, item.unit]
      );

      const updatedItem = invUpdate.rows[0];

      // B. Audit Trail (Filing Readiness)
      await client.query(
        `INSERT INTO inventory_transactions (inventory_id, raw_input_id, change_amount, transaction_type, performed_by)
         VALUES ($1, $2, $3, 'INWARD', $4)`,
        [updatedItem.id, raw_input_id, item.quantity, user_id]
      );
      
      // Yahan aap Low Stock Alert trigger kar sakte hain agar quantity threshold se niche jaye
    }

    // 3. Mark bill as APPROVED
    await client.query(
      `UPDATE raw_inputs SET status = 'APPROVED', processed_by = $1 WHERE id = $2`,
      [user_id, raw_input_id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: "Inventory synced and bill filed successfully!"
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Approval Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};