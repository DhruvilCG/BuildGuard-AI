import * as db from "../config/db.js";
import axios from "axios";

export const updateStock = async (req, res) => {
  try {
    const { site_id, item_name, quantity, unit, threshold } = req.body;

    // inventoryController.js ke andar INSERT query ko aise replace karein:
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

    // Alert Logic
    if (parseFloat(item.quantity) <= parseFloat(item.threshold)) {
      const contacts = await db.query(
        `SELECT 
            m.phone_number as mgr_phone, m.full_name as mgr_name,
            a.phone_number as adm_phone, a.full_name as adm_name,
            s.site_name
         FROM sites s
         LEFT JOIN users m ON s.manager_id = m.id
         LEFT JOIN users a ON s.admin_id = a.id
         WHERE s.id = $1`,
        [site_id]
      );

      if (contacts.rows.length > 0) {
        const info = contacts.rows[0];
        // Trigger Webhook
        if (process.env.N8N_WEBHOOK_URL) {
          await axios.post(process.env.N8N_WEBHOOK_URL, {
            site: info.site_name,
            item: item_name,
            qty: quantity,
            unit: unit,
            manager: { name: info.mgr_name, phone: info.mgr_phone },
            admin: { name: info.adm_name, phone: info.adm_phone },
          });
          console.log("✅ Webhook triggered for low stock");
        }
      }
    }
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Inventory update failed" });
  }
};


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