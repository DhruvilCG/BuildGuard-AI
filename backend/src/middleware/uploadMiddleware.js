import multer from "multer";
import path from "path";

// Set storage to memory if you plan to upload to Cloudinary/S3, 
// or disk storage for local testing.
const storage = multer.memoryStorage(); 

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".jpg", ".jpeg", ".png", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only Photos and PDFs are supported"), false);
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});