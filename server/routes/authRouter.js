// server/routes/authRouter.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import passport from '../config/passport.js';
import { auth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

const authRouter = express.Router();

const issueJwt = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setJwtCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const pickUser = (u) => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  phone: u.phone,
  role: u.role,
  status: u.status,
});

/* ===== Credentials auth ===== */
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: 'customer',
      status: 'active',
    });

    const token = issueJwt(user.id);
    setJwtCookie(res, token);
    res.json({ token, user: pickUser(user) });
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = issueJwt(user.id);
    setJwtCookie(res, token);
    res.json({ token, user: pickUser(user) });
  })
);

/* ===== Google OAuth ===== */
authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/failure', session: true }),
  (req, res) => {
    const token = issueJwt(req.user.id);
    setJwtCookie(res, token);
    const redirectTo = process.env.CLIENT_URL || 'http://localhost:5173';
    // Optionally append ?token=... if you want the SPA to pick it up from URL:
    // return res.redirect(`${redirectTo}/?token=${encodeURIComponent(token)}`);
    return res.redirect(redirectTo);
  }
);

/* ===== Session ===== */
authRouter.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const u = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'status'],
    });
    res.json({ user: u ? pickUser(u) : null });
  })
);

authRouter.post('/logout', (req, res) => {
  if (typeof req.logout === 'function') req.logout(() => {});
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ ok: true });
});

authRouter.get('/failure', (_req, res) => res.status(401).json({ error: 'OAuth failed' }));

export default authRouter;
