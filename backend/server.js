import dotenv from 'dotenv';
dotenv.config();

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './config/db.js';
import eventRoutes from './routes/eventRoutes.js';
import cronRoutes from './routes/cronRoutes.js';

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Route
app.get('/api/health', (_, res) => {
  return res.status(200).json({message: "I am fine you can continue"});
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/cron', cronRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server started');
});