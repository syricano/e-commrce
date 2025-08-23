import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import auth from '../middleware/auth.js';
import {
  register, login, logout, me, changePassword,
  requestPasswordReset, confirmPasswordReset
} from '../controllers/auth.controller.js';

const router = express.Router();

// Credentials
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, me);
router.post('/change-password', auth, changePassword);

// Reset password
router.post('/reset/request', requestPasswordReset);
router.post('/reset/confirm', confirmPasswordReset);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: (process.env.CLIENT_URL || '/') + '/login?error=oauth' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    const redirectTo = process.env.CLIENT_URL || '/';
    res.redirect(redirectTo);
  }
);

export default router;
