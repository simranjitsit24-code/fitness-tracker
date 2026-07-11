import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import workoutRoutes from './routes/workouts.js';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Check if MONGODB_URI exists
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables!');
  console.error('Please set MONGODB_URI in Render dashboard');
  process.exit(1);
}

// ✅ CORS Configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fitness-tracker-1-sasm.onrender.com', // Your frontend URL
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    mongodb: MONGODB_URI ? '✅ Configured' : '❌ Missing',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// MongoDB connection with better error handling
console.log('🔌 Attempting to connect to MongoDB...');
console.log(`📡 MONGODB_URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials in logs

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check:');
    console.error('1. MONGODB_URI is correct in Render environment variables');
    console.error('2. Username and password are correct');
    console.error('3. Network access is enabled (0.0.0.0/0) in MongoDB Atlas');
    console.error('4. Database name is correct');
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
});
