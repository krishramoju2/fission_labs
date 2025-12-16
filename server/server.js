import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Base64 can be large

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
