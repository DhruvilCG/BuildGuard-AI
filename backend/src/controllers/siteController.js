import * as db from '../config/db.js';

export const createSite = async (req, res) => {
  try {
    const { site_name, location, admin_id } = req.body;
    const manager_id = req.user.id; // From JWT Middleware

    const result = await db.query(
      "INSERT INTO sites (site_name, location, manager_id, admin_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [site_name, location, manager_id, admin_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create site" });
  }
};

export const getSites = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM sites");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sites" });
    }
};