import { v2 as cloudinary } from 'cloudinary';
import * as db from "../config/db.js";
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadRawInput = async (req, res) => {
  try {
    const { site_id } = req.body;
    const file = req.file;

    // Validation
    if (!site_id) return res.status(400).json({ error: "site_id is required" });
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // 1. Upload to Cloudinary using the file buffer
    // We use a Promise to handle the stream upload asynchronously
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: "buildguard_raw_inputs", // Auto-creates this folder in Cloudinary
            resource_type: "auto"            // Handles both Image and PDF
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer); // Sending the file data
      });
    };

    const cloudinaryResponse = await uploadToCloudinary();
    const file_url = cloudinaryResponse.secure_url;
    const file_type = file.mimetype.includes('pdf') ? 'PDF' : 'PHOTO';

    // 2. Save to PostgreSQL (Table 5: raw_inputs)
    // Remember: our schema has site_id, file_url, file_type, status
    const query = `
      INSERT INTO raw_inputs (site_id, file_url, file_type, status) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
    
    const values = [site_id, file_url, file_type, 'PENDING'];
    const result = await db.query(query, values);

    // 3. Response to Frontend
    res.status(201).json({
      success: true,
      message: "File uploaded successfully to Cloudinary and DB",
      data: result.rows[0] // This includes the new ID and Cloudinary URL
    });

  } catch (err) {
    console.error("❌ Cloudinary/DB Error:", err);
    res.status(500).json({ error: "Internal Server Error during upload" });
  }
};