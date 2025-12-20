import express from 'express';
import { createSite, getSites } from '../controllers/siteController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken , createSite);
router.get('/', verifyToken , getSites);

export default router;