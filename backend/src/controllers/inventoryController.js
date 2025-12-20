import * as db from '../config/db.js';

// 1. Add or Update Stock
export const updateStock = async (req, res) => {
  try {
    const { site_id, item_name, quantity, unit, threshold } = req.body;

    // Pehle check karte hain ki kya ye item pehle se us site par hai?
    const existingItem = await db.query(
      "SELECT * FROM inventory WHERE site_id = $1 AND item_name = $2",
      [site_id, item_name]
    );

    let result;
    if (existingItem.rows.length > 0) {
      // Agar hai, toh quantity update karo
      result = await db.query(
        "UPDATE inventory SET quantity = $1, threshold = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
        [quantity, threshold, existingItem.rows[0].id]
      );
    } else {
      // Agar naya hai, toh insert karo
      result = await db.query(
        "INSERT INTO inventory (site_id, item_name, quantity, unit, threshold) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [site_id, item_name, quantity, unit, threshold]
      );
    }

    const item = result.rows[0];
    
    // Low Stock Alert Logic
    let alert = null;
    if (parseFloat(item.quantity) <= parseFloat(item.threshold)) {
      alert = `⚠️ ALERT: ${item.item_name} is running low at this site!`;
    }

    res.status(201).json({
      message: "Stock Updated Successfully",
      data: item,
      alert: alert
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update inventory" });
  }
};

// 2. Get Inventory for a Specific Site
export const getInventoryBySite = async (req, res) => {
  try {
    const { site_id } = req.params;
    const result = await db.query(
      "SELECT * FROM inventory WHERE site_id = $1 ORDER BY item_name ASC",
      [site_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};