import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import logger from './utils/logger.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Global error handlers for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env as well as root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

import batchRoutes from './routes/batchRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import tutorReportRoutes from './routes/tutorReportRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import { runTransferCronJob } from './cron/batchCron.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive CORS for smooth deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions
});
app.set('socketio', io);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Add Request ID to every request
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Log incoming HTTP requests using Morgan and Winston
const morganFormat = process.env.NODE_ENV === 'production' 
  ? ':method :url :status :res[content-length] - :response-time ms :remote-addr' // Extended format for prod
  : 'dev';

app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Serve uploaded files as static assets with CORS headers
app.use('/uploads', cors(corsOptions), express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB with fallback
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/glosmart';
mongoose.connect(mongoUri, { family: 4 })
  .then(() => logger.info(`Connected to MongoDB at ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`))
  .catch((err) => logger.error('MongoDB connection error:', { error: err.message }));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tutor-reports', tutorReportRoutes);
app.use('/api/batch-transfers', transferRoutes);

// Run every night at midnight: 0 0 * * *
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('[Cron] Executing scheduled batch transfer check...');
    await runTransferCronJob();
  } catch (error) {
    logger.error('Error executing transfer cron job:', { error: error.message });
  }
});

// Run once on startup after 5 seconds to catch any missed updates
setTimeout(async () => {
  try {
    logger.info('[Startup] Running initial batch transfer check...');
    await runTransferCronJob();
  } catch (error) {
    logger.error('Error executing transfer cron job:', { error: error.message });
  }
}, 5000);

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'Glosmart API is running successfully' });
});

// Custom Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
