import * as db from "./src/config/db.js";

const setupDatabase = async () => {
  try {
    console.log("⏳ Creating tables...");

    // 1. Sites Table
    await db.query(`
  CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL,
    location TEXT,
    status VARCHAR(20) DEFAULT 'Active', -- Kaam chal raha hai ya khatam?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

    // 2. Inventory Table
    await db.query(`
  CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    item_name VARCHAR(50) NOT NULL,
    quantity DECIMAL DEFAULT 0,
    unit VARCHAR(20) NOT NULL, -- Bags, kg, Liters, etc.
    threshold INTEGER DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

    console.log("🚀 Tables 'sites' and 'inventory' created successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
};

setupDatabase();
