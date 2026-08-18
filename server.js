require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const districtRoutes = require('./routes/districtRoutes');
const breakingNewsRoutes = require('./routes/breakingNewsRoutes');
const reporterRoutes = require('./routes/reporterRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const pageRoutes = require('./routes/pageRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- Security & core middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Static file serving for locally-stored uploads. Only used as a local-dev fallback —
// on most free hosts the filesystem is wiped on every restart/deploy, so production
// should set the CLOUDINARY_* env vars (see .env.example) and uploads go there instead.
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ success: true, message: 'LNN API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/breaking-news', breakingNewsRoutes);
app.use('/api/reporters', reporterRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`LNN backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

// Only auto-connect + listen when this file is run directly (`node server.js`).
// When required by tests (e.g. via supertest), the app is exported without side effects.
if (require.main === module) {
  start();
}

module.exports = { app, start };
