// server.js - Main application entry point
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

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

app.use(helmet({ contentSecurityPolicy: false }));

// CORS - inclut ton domaine cpcenicarthage.tn
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://competitive-programming-club-front.vercel.app',
  'https://cpcenicarthage.tn',
  'https://www.cpcenicarthage.tn'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ======================
// ROUTES
// ======================

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  res.status(200).json({
    success: true,
    message: 'CPC Backend is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      connected: dbStatus === 1,
      host: mongoose.connection.host,
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!', timestamp: new Date().toISOString() });
});

app.use('/api/applications', applicationRoutes);

// ======================
// ERROR HANDLING
// ======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// ======================
// EXPORT POUR VERCEL
// ======================
module.exports = app;
