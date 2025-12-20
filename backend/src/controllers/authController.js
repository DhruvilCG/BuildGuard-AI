import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as db from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { username, password, phone_number, email, role } = req.body;
    
    // Password ko hash karna (Security)
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (username, password, phone_number, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username",
      [username, hashedPassword, phone_number, email, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "User registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(401).json({ error: "Invalid password" });

    // JWT Token create karna
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, role: user.rows[0].role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};