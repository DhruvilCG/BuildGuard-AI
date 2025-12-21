import * as db from "../config/db.js";

export const addVendor = async (req, res) => {
  try {
    const { item_name, vendor_name, vendor_email, vendor_phone } = req.body;

    const result = await db.query(
      `INSERT INTO vendors (item_name, vendor_name, vendor_email, vendor_phone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (item_name) 
       DO UPDATE SET 
         vendor_name = EXCLUDED.vendor_name,
         vendor_email = EXCLUDED.vendor_email,
         vendor_phone = EXCLUDED.vendor_phone
       RETURNING *`,
      [item_name, vendor_name, vendor_email, vendor_phone]
    );

    res.status(201).json({
      message: "✅ Vendor added/updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to add vendor" });
  }
};