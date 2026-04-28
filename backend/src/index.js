const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const prisma = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

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

const ensureDatabaseSchema = async () => {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "paymentInfo" TEXT;');
    console.log('✅ Database schema check complete: paymentInfo column is present.');
  } catch (err) {
    console.warn('⚠️ Unable to ensure paymentInfo column:', err.message || err);
  }
};

const PORT = process.env.PORT || 5000;
ensureDatabaseSchema().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
});
