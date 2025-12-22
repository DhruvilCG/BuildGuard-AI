import express from "express";
import { uploadRawInput } from "../controllers/aiController.js";
import { upload } from "../middleware/uploadMiddleware.js"; // We will create this next

const router = express.Router();

// The "upload.single('file')" looks for a field named 'file' in the request
router.post("/upload", upload.single("file"), uploadRawInput);

export default router;