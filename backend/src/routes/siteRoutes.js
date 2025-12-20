import express from 'express';
import { createSite, getSites } from '../controllers/siteController.js';

const router = express.Router();

router.post('/', createSite);
router.get('/', getSites);

export default router;