import { v2 as cloudinary } from 'cloudinary';
import * as db from "../config/db.js";
import { analyzeBillWithAI } from "../services/aiService.js";
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadRawInput = async (req, res) => {
  try {
    const { site_id } = req.body;
    const file = req.file;

    if (!site_id) return res.status(400).json({ error: "site_id is required" });
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // 1. Upload to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "buildguard_raw_inputs", resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
    };

    const cloudinaryResponse = await uploadToCloudinary();
    const file_url = cloudinaryResponse.secure_url;
    const file_type = file.mimetype.includes('pdf') ? 'PDF' : 'PHOTO';

    // 2. Initial Save to DB (Status: PENDING)
    const insertQuery = `
      INSERT INTO raw_inputs (site_id, file_url, file_type, status) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id`;
    
    const dbResult = await db.query(insertQuery, [site_id, file_url, file_type, 'PENDING']);
    const rawInputId = dbResult.rows[0].id;

    // 3. 🚀 Call AI Service to extract data
    console.log("⏳ AI Analyzing started...");
    const extractedData = await analyzeBillWithAI(file_url, file_type);

    // 4. Update DB with Extracted Data
    if (extractedData) {
      await db.query(
        `UPDATE raw_inputs SET extracted_data = $1 WHERE id = $2`,
        [JSON.stringify(extractedData), rawInputId]
      );
    }

    // 5. Response
    res.status(201).json({
      success: true,
      message: "File processed and AI data extracted.",
      raw_input_id: rawInputId,
      cloudinary_url: file_url,
      extracted_data: extractedData
    });

  } catch (err) {
    console.error("❌ Process Error:", err);
    res.status(500).json({ error: "Internal Server Error during processing" });
  }
};