import express from 'express';
import { updateStock, getInventoryBySite } from '../controllers/inventoryController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Stock Update/Add (Protected: Login zaroori hai)
// Route: POST /api/inventory/update
router.post('/update', verifyToken, updateStock);

// 2. Get Stock of a specific site (Protected: Login zaroori hai)
// Route: GET /api/inventory/:site_id
router.get('/:site_id', verifyToken, getInventoryBySite);


router.post("/approve", protect, approveRawInput);

export default router;