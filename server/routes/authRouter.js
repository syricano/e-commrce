import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';


const router = express.Router();

// Kick off Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

// OAuth callback -> sign JWT -> set cookie -> redirect to frontend
router.get('/google/callback',
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

// Optional: logout clears cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

export default router;
