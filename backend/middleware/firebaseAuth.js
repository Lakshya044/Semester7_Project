const { verifyIdToken } = require('../firebaseAdmin');

module.exports = async function firebaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header. Expected: Bearer <idToken>' });
    }
    const idToken = match[1];
    let decoded;
    try {
      decoded = await verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired ID token', details: e.message || String(e) });
    }
    // set Firebase UID for downstream handlers
    req.userId = decoded.uid;
    // optional: attach decoded token for roles/custom claims
    req.firebaseUser = decoded;
    next();
  } catch (e) {
    res.status(500).json({ error: 'Authentication failure', details: e && e.message ? e.message : String(e) });
  }
};
