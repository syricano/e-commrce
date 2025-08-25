// server/routes/authRouter.js
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import { auth } from '../middleware/auth.js';

const authRouter = express.Router();

const setJwtCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Start Google OAuth
authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

// Google OAuth callback
authRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/failure', session: true }),
  (req, res) => {
    setJwtCookie(res, req.user.id);
    const redirectTo = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(redirectTo);
  }
);

// Current user
authRouter.get('/me', auth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    status: req.user.status,
  });
});

// Logout
authRouter.post('/logout', (req, res) => {
  if (typeof req.logout === 'function') req.logout(() => {});
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ ok: true });
});

// Failure
authRouter.get('/failure', (_req, res) => res.status(401).json({ error: 'OAuth failed' }));

export default authRouter;
