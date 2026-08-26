import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import ticketRoutes from './routes/ticketRoutes';

import { validateEnv } from './config/envValidator';
import { globalErrorHandler } from './models/middlewares/errorHandler';

dotenv.config();

// Validate Environment Variables First (Fail Fast)
validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

import path from 'path';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import { globalLimiter } from './models/middlewares/rateLimiter';
app.use('/api', globalLimiter); // Apply to all API routes by default

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Centralized Error Handling Middleware
app.use(globalErrorHandler);

// Start Server & Connect DB
const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('✅ Connection to MS SQL Server has been established successfully.');

    // Manually ensure TicketHistory table exists to fix "Invalid object name" error
    const { TicketHistory } = require('./models/TicketHistory');
    if (TicketHistory) await TicketHistory.sync();
    console.log('✅ TicketHistories table verified.');

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
