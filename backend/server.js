// server.js

import dotenv from 'dotenv';
dotenv.config();

import express, { json, urlencoded } from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';

import connectDB          from './config/db.js';
import eventRoutes        from './routes/eventRoutes.js';
import customEventRoutes  from './routes/customEventRoutes.js';
import cronRoutes         from './routes/cronRoutes.js';

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  try {
    res.json({
    success:   true,
    message:   'ShubhaMAI Server is Started'
  });
  } catch (error) {
    console.log(error.message)
  }
  
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/events',        eventRoutes);        // public — no auth required
app.use('/api/custom-events', customEventRoutes);  // user custom events
app.use('/api/cron',          cronRoutes);          // cron service endpoints (protected by CRON_SECRET)

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ShubhaMAI backend running on port ${PORT}`);
});