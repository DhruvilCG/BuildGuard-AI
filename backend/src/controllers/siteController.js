import * as db from '../config/db.js';

// Create New Site
export const createSite = async (req, res) => {
  try {
    // manager_id hum token se nikaal rahe hain (req.user.id)
    const manager_id = req.user.id; 
    const { site_name, location } = req.body;

    const result = await db.query(
      "INSERT INTO sites (site_name, location, manager_id) VALUES ($1, $2, $3) RETURNING *",
      [site_name, location, manager_id]
    );

    res.status(201).json({
      message: "Site created successfully",
      site: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create site" });
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

