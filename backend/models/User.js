const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  email: { type: String, index: true },
  displayName: String,
  photoURL: String,
  providerData: Array,
  customClaims: Object,
  lastSeen: Date,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
