// backend/db/index.js
const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (isConnected) return;
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, { autoIndex: true });
    isConnected = true;
    console.log('[DB] MongoDB connected');
  } catch (err) {
    console.error('[DB] Failed to connect MongoDB:', err && err.message ? err.message : String(err));
  }
}

module.exports = { connectDB };
