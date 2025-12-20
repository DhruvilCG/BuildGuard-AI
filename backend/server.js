import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import siteRoutes from './src/routes/siteRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api/sites', siteRoutes);

app.get('/', (req, res) => {
  res.send('BuildGuard AI API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});