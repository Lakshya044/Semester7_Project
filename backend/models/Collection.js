// backend/models/Collection.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  originalName: String,
  storedName: String, // S3 key or filename
  size: Number,
  mimeType: String,
  publicUrl: String, // optional if using local public folder; null when using S3
  pages: Number,
}, { _id: false, timestamps: true });

const analysisSchema = new mongoose.Schema({
  extracted_sections: Array,
  subsection_analysis: Array,
  meta: Object,
  durationMs: Number,
}, { _id: false, timestamps: true });

const collectionSchema = new mongoose.Schema({
  // store Firebase UID directly (string)
  collectionId: { type: String, unique: true, index: true, default: () => require('crypto').randomUUID() },
  userId: { type: String, index: true }, // <-- changed: Firebase UID (string) instead of ObjectId
  name: String,
  persona: String,
  jobToBeDone: String,
  documents: [documentSchema],
  analysis: analysisSchema,
  status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  lastRunAt: Date,
}, { timestamps: true });

// Enforce uniqueness of collection name per user
collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
