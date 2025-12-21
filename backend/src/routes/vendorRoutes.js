import express from 'express';
import { addVendor } from '../controllers/vendorController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/vendors/add
router.post('/add', verifyToken, addVendor);

export default router;