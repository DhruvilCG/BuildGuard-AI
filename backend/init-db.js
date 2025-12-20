import * as db from './src/config/db.js';

const setupDatabase = async () => {
  try {
    console.log("⏳ Initializing BuildGuard AI Database...");

    // 1. Users Table (For Auth and Contact Details)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone_number VARCHAR(15) NOT NULL, -- For WhatsApp Alerts
        email VARCHAR(100) UNIQUE NOT NULL, -- For PDF Reports
        role VARCHAR(20) DEFAULT 'MANAGER', -- ADMIN or MANAGER
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Sites Table (Linked to a Manager)
    await db.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id SERIAL PRIMARY KEY,
        site_name VARCHAR(100) NOT NULL,
        location TEXT,
        status VARCHAR(20) DEFAULT 'Active',
        manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Inventory Table (Linked to a Site)
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

    console.log("🚀 All tables created and linked successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Database Init Error:", err);
    process.exit(1);
  }
};

setupDatabase();