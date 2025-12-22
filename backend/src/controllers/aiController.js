import * as db from "../config/db.js";

export const uploadRawInput = async (req, res) => {
  try {
    const { site_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // 1. In a real app, upload file to S3/Cloudinary here
    const file_url = `uploads/${file.originalname}`; // Placeholder

    // 2. Save to PostgreSQL (Table 5: raw_inputs)
    const result = await db.query(
      `INSERT INTO raw_inputs (site_id, file_url, file_type, status) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [site_id, file_url, file.mimetype.includes('pdf') ? 'PDF' : 'PHOTO', 'PENDING']
    );

    // 3. (Next Step) Trigger AI Processing & Pinecone Vectorization
    
    res.status(201).json({
      message: "File uploaded successfully. Pending AI analysis.",
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};