import * as db from '../config/db.js';

export const createSite = async (req, res) => {
  try {
    // total_budget ko req.body mein add kiya gaya hai
    const { site_name, location, admin_id, total_budget } = req.body; 
    const manager_id = req.user.id; // From JWT Middleware

    const result = await db.query(
      "INSERT INTO sites (site_name, location, manager_id, admin_id, total_budget, current_spending) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [site_name, location, manager_id, admin_id, total_budget || 0, 0] // 0 as initial spending [cite: 2025-12-16]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create site" });
  }
};

export const getSites = async (req, res) => {
    try {
        // AI analysis ke liye budget aur spending columns ko bhi select karega [cite: 2025-12-16]
        const result = await db.query("SELECT * FROM sites ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sites" });
    }
};