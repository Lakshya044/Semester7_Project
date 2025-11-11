// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { connectDB } = require('./db/index');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
  // Allow Authorization and other common headers so uploads and token-bearing requests succeed
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Connect to MongoDB if configured
connectDB();

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// New routes: auth and files
try {
  const authRoutes = require('./routes/auth');
  app.use('/auth', authRoutes);
} catch {}
try {
  const filesRoutes = require('./routes/files');
  app.use('/api/files', filesRoutes);
} catch {}

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// --- Graceful shutdown cleanup ---
const uploadsDir = path.join(__dirname, 'uploads');
const frontendPdfsDir = path.resolve(__dirname, '../frontend/public/pdfs');

function clearFrontendPdfs() {
  try {
    if (!fs.existsSync(frontendPdfsDir)) return { deleted: 0 };
    const entries = fs.readdirSync(frontendPdfsDir);
    let deleted = 0;
    for (const entry of entries) {
      if (entry.toLowerCase().endsWith('.pdf')) {
        try {
          fs.unlinkSync(path.join(frontendPdfsDir, entry));
          deleted++;
        } catch (e) {
          console.warn('Could not delete PDF on shutdown:', entry, e && e.message ? e.message : String(e));
        }
      }
    }
    return { deleted };
  } catch (e) {
    console.warn('Error clearing frontend PDFs on shutdown:', e && e.message ? e.message : String(e));
    return { deleted: 0 };
  }
}

function clearUploadsDir() {
  try {
    if (fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true });
    }
    // Recreate empty uploads dir for next start
    fs.mkdirSync(uploadsDir, { recursive: true });
    return true;
  } catch (e) {
    console.warn('Error clearing uploads dir on shutdown:', e && e.message ? e.message : String(e));
    return false;
  }
}

function shutdown(signal) {
  console.log(`\nReceived ${signal}. Cleaning up files before exit...`);
  const front = clearFrontendPdfs();
  const back = clearUploadsDir();
  console.log(`Cleanup complete. Frontend PDFs deleted: ${front.deleted}. Uploads cleared: ${back}.`);

  server.close(() => {
    console.log('HTTP server closed. Exiting.');
    process.exit(0);
  });
  // Fallback exit if server doesn't close quickly
  setTimeout(() => process.exit(0), 1500).unref();
}

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});
