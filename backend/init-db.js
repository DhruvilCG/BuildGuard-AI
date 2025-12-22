import * as db from "./src/config/db.js";

const setupDatabase = async () => {
  try {
    console.log("⏳ Finalizing BuildGuard AI Pro Schema...");

    // 1. Users
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name VARCHAR(100), 
        phone_number VARCHAR(15) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'MANAGER', -- ADMIN, MANAGER, SUPERVISOR
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Sites
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

    // 3. Vendors
    await db.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
        vendor_name VARCHAR(100) NOT NULL,
        vendor_email VARCHAR(100) NOT NULL,
        vendor_phone VARCHAR(15),
        category VARCHAR(50), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Inventory
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
        item_name VARCHAR(50) NOT NULL,
        quantity DECIMAL DEFAULT 0,
        unit VARCHAR(20) NOT NULL,
        threshold INTEGER DEFAULT 10,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Raw Inputs (Smart Input Support & Human-in-the-Loop)
    await db.query(`
      CREATE TABLE IF NOT EXISTS raw_inputs (
        id SERIAL PRIMARY KEY,
        site_id INTEGER REFERENCES sites(id),
        file_url TEXT, 
        file_type VARCHAR(20), 
        extracted_data JSONB, 
        status VARCHAR(20) DEFAULT 'PENDING', 
        processed_by INTEGER REFERENCES users(id),
        is_vectorized BOOLEAN DEFAULT FALSE, -- 🚀 NEW: To track if added to Pinecone for fraud check
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Inventory Transactions (Filing & Audit Readiness) 🚀 NEW
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id SERIAL PRIMARY KEY,
        inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
        raw_input_id INTEGER REFERENCES raw_inputs(id) ON DELETE SET NULL,
        change_amount DECIMAL NOT NULL, 
        transaction_type VARCHAR(20), -- 'INWARD' (Purchase), 'OUTWARD' (Usage)
        performed_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Alerts (Health System)
    await db.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
        inventory_id INTEGER REFERENCES inventory(id),
        alert_type VARCHAR(50), -- 'LOW_STOCK', 'UNUSUAL_ACTIVITY'
        message TEXT,
        status VARCHAR(20) DEFAULT 'UNREAD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Knowledge Base (Instant Search Knowledge Base) 🚀 NEW
    await db.query(`
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id SERIAL PRIMARY KEY,
        site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50), 
        pinecone_id VARCHAR(255), -- 🚀 NEW: To link with Pinecone vector
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("🚀 All 8 Tables Created Successfully! BuildGuard AI is ready.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Schema Error:", err);
    process.exit(1);
  }
};

setupDatabase();