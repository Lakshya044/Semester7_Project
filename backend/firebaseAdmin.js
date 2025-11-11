const admin = require('firebase-admin');
const fs = require('fs');

let initialized = false;
let adminApp = null;

function tryLoadServiceAccount() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    try {
      return require(serviceAccountPath);
    } catch (e) {
      console.error('Failed to require service account file at', serviceAccountPath, e && e.message ? e.message : e);
      throw e;
    }
  }

  if (serviceAccountJson) {
    try {
      return JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON:', e && e.message ? e.message : e);
      throw e;
    }
  }

  // No credentials provided
  return null;
}

function initFirebaseAdmin() {
  if (initialized) return adminApp;
  const credObj = tryLoadServiceAccount();
  if (!credObj) {
    // Do not throw at module load; warn and leave uninitialized.
    console.warn('Firebase admin not initialized: no service account configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON to enable Firebase admin features.');
    initialized = false;
    adminApp = null;
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(credObj),
      // databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
    });
    adminApp = admin;
    initialized = true;
    return adminApp;
  } catch (e) {
    console.error('Failed to initialize Firebase admin:', e && e.message ? e.message : e);
    initialized = false;
    adminApp = null;
    throw e;
  }
}

// Verify ID token (lazy-initializes admin). Throws if admin not configured or token invalid.
async function verifyIdToken(idToken) {
  if (!idToken) throw new Error('No ID token provided');
  const app = initFirebaseAdmin();
  if (!app) {
    throw new Error('Firebase admin SDK is not configured on the server. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in the backend environment.');
  }
  return app.auth().verifyIdToken(idToken);
}

// Export a getter for the initialized admin app (may be null if not configured)
function getAdmin() {
  return adminApp;
}

module.exports = {
  initFirebaseAdmin,
  verifyIdToken,
  getAdmin
};
