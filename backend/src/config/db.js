import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Connected to the PostgreSQL Database');
});

// Named export for the query function
export const query = (text, params) => pool.query(text, params);