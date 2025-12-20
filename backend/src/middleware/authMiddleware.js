import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Token headers se nikalna (Conventionally: 'Authorization: Bearer <TOKEN>')
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: "Access Denied: No token provided" });
  }

  try {
    // Secret key se token verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // User ka data (id, role) request object mein save karna taaki controllers ise use kar sakein
    req.user = decoded; 
    
    next(); // Agar sab sahi hai, toh aage (Controller) jaane do
  } catch (err) {
    return res.status(401).json({ error: "Invalid or Expired Token" });
  }
};