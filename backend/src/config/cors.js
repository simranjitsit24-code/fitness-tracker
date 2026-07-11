// backend/src/config/cors.js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fitness-tracker-1-sasm.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

export const corsOptions = {
  origin: function (origin, callback) {
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
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
};

export default allowedOrigins;
