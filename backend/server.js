import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import siteRoutes from './src/routes/siteRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import inventoryRoutes from './src/routes/inventoryRoutes.js' ;

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/sites', siteRoutes);

app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => {
  res.send('BuildGuard AI API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});