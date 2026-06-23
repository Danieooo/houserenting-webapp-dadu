const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'tauri://localhost',
  'http://tauri.localhost',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || !process.env.CLIENT_URL || process.env.CLIENT_URL === '*') {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.on('finish', () => console.log(`[API]   -> ${res.statusCode}`));
  next();
});
if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
}

// Health check (public — dùng cho keep-alive ping)
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
