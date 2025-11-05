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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: String,
  persona: String,
  jobToBeDone: String,
  documents: [documentSchema],
  analysis: analysisSchema,
  status: { type: String, enum: ['idle', 'processing', 'ready', 'error'], default: 'idle' },
  lastRunAt: Date,
}, { timestamps: true });

module.exports = mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
