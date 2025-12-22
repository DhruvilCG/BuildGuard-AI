import express from "express";
import { uploadRawInput } from "../controllers/aiController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js"; // Optional: if auth is ready

const router = express.Router();

// Route for Smart Input (Photo/PDF)
router.post("/upload", upload.single("file"), uploadRawInput);

export default router;