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

// 🟢 Google OAuth Login

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/signin',
    session: true,
  }),
  (req, res) => {
    if (!req.user) {
      console.log('❌ req.user is missing');
      return res.redirect('/signin');
    }

    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('✅ Google user authenticated:', req.user.email);
    console.log('✅ Redirecting to frontend:', `${process.env.CLIENT_URL}/profile`);

    res.redirect(`${process.env.CLIENT_URL}/profile`);
  }
);

export default router;
