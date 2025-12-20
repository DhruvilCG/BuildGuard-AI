import express from 'express';
import { register, login, getAdmins } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/admins', verifyToken, getAdmins); // Dropdown search

export default router;