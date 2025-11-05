// backend/routes/auth.js
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('../models/User');

const router = express.Router();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (_accessToken, _refreshToken, profile, done) => {
  try {
    const email = Array.isArray(profile.emails) && profile.emails[0] ? profile.emails[0].value : undefined;
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email,
        avatar: Array.isArray(profile.photos) && profile.photos[0] ? profile.photos[0].value : undefined,
      });
    }
    return done(null, user);
  } catch (e) {
    return done(e);
  }
}));

router.use(cookieParser());

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth' }),
  async (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('ax_jwt', token, {
      httpOnly: true,
      secure: false, // set true with HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect('/');
  }
);

router.post('/logout', (req, res) => {
  res.clearCookie('ax_jwt');
  res.status(204).end();
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.ax_jwt;
    if (!token) return res.status(401).json({ ok: false });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ ok: false });
    res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (_e) {
    res.status(401).json({ ok: false });
  }
});

module.exports = router;
