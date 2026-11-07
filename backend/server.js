const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

const app = express();

// ✅ 1 — All Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Allowed frontend origins: set CORS_ORIGINS in .env (comma separated)
// e.g. CORS_ORIGINS=https://myapp.com,https://www.myapp.com
const allowedOrigins = (process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ 2 — Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Make sure Uploads folder exists on startup
const uploadsDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads folder created');
}

// ✅ 3 — All Routes
const authRouter = require('./Router/AuthRouter');
const userRouter = require('./Router/UserRouter');
const companyRouter = require('./Router/CompanyRouter');
const jobRouter = require('./Router/JobRouter');
const applicationRouter = require('./Router/ApplicationRouter');
const adminRouter = require('./Router/AdminRouter');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/company', companyRouter);
app.use('/api/v1/job', jobRouter);
app.use('/api/v1/application', applicationRouter);
app.use('/api/v1/admin', adminRouter);

// ✅ 3.5 — Health check (Docker, load balancer, UptimeRobot, Jenkins use this)
app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'degraded',
    db: dbUp ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime())
  });
});

// ✅ 4 — Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Portal API is running'
  });
});

// ✅ 5 — 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ✅ 6 — Global error handler (handles multer errors too — server will NOT crash)
app.use((err, req, res, next) => {
  // Multer file type error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and image files (JPG, PNG, WEBP) are allowed'
      });
    }
  }

  // Custom file filter error
  if (err.message === 'Only PDF and image files allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF and image files (JPG, PNG, WEBP) are allowed. Please upload a PDF resume.'
    });
  }

  console.error('Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ✅ 7 — MongoDB connect + server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log('❌ DB Error:', err);
    process.exit(1);
  });