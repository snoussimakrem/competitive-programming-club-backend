// server.js - Main application entry point
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

// Debug: Check if env vars are loaded
console.log('Environment variables loaded:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');

// Import routes
const applicationRoutes = require('./routes/applications');

// Import database connection
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// ======================
// DATABASE CONNECTION
// ======================
connectDB();

// ======================
// MIDDLEWARE SETUP
// ======================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for now to simplify
}));

// CORS configuration - more permissive for development
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://competitive-programming-club-front.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Body:', req.body);
  next();
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// ======================
// ROUTES
// ======================

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbStatus] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'CPC Backend is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    database: {
      status: dbStatusText,
      connected: dbStatus === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    server: {
      port: process.env.PORT,
      uptime: process.uptime()
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/applications', applicationRoutes);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../cpc-frontend/build')));

// ======================
// ERROR HANDLING
// ======================

// 404 handler - serves React app for non-API routes
app.use((req, res, next) => {
  // If it's not an API route, serve the React app
  if (!req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, '../cpc-frontend/build/index.html'));
  }

  // For API routes that don't exist, return 404 JSON
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// ======================
// SERVER START
// ======================

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;