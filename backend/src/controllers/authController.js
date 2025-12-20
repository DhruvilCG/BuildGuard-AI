import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as db from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { username, password, full_name, phone_number, email, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (username, password, full_name, phone_number, email, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, full_name",
      [username, hashedPassword, full_name, phone_number, email, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { id: user.rows[0].id, full_name: user.rows[0].full_name, role: user.rows[0].role } 
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const { search } = req.query;
    const result = await db.query(
      "SELECT id, full_name FROM users WHERE role = 'ADMIN' AND full_name ILIKE $1",
      [`%${search || ''}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};