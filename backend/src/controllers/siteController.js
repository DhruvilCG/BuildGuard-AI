import * as db from '../config/db.js';

// Create New Site
export const createSite = async (req, res) => {
  try {
    const { site_name, location } = req.body;
    const result = await db.query(
      "INSERT INTO sites (site_name, location) VALUES ($1, $2) RETURNING *",
      [site_name, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Sites
export const getSites = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM sites ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};