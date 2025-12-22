import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js'; // Aapne file ka naam authRoute.js rakha hai
import siteRoutes from './src/routes/siteRoutes.js'; 
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import vendorRoutes from './src/routes/vendorRoutes.js';
import aiRoutes from "./src/routes/aiRoutes.js  ";

dotenv.config();
const app = express();
app.use(express.json());

// Routes Linking
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));