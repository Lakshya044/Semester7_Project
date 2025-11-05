// backend/middleware/requireAuth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization;
    const token = req.cookies?.ax_jwt || (bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : null);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { requireAuth };
