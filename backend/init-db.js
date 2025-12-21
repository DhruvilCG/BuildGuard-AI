import * as db from "./src/config/db.js";

const setupDatabase = async () => {
  try {
    console.log("⏳ Updating BuildGuard AI Schema...");

    // 1. Users Table (Added full_name)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name VARCHAR(100), 
        phone_number VARCHAR(15) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'MANAGER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Sites Table (Added admin_id to link site to an Owner)
    await db.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id SERIAL PRIMARY KEY,
        site_name VARCHAR(100) NOT NULL,
        location TEXT,
        manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL, 
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Inventory Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
        item_name VARCHAR(50) NOT NULL,
        quantity DECIMAL DEFAULT 0,
        unit VARCHAR(20) NOT NULL,
        threshold INTEGER DEFAULT 10,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4.Vendor Table         
    await db.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(50) UNIQUE NOT NULL, -- Ek item ka ek hi master vendor
        vendor_name VARCHAR(100) NOT NULL,
        vendor_email VARCHAR(100) NOT NULL,
        vendor_phone VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("🚀 Schema Updated Successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};
setupDatabase();
