import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

const signAndSetCookie = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return token;
};

// POST /api/auth/register  (admin could also create user via /api/users)
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) throw new ErrorResponse('Email and password required', 400);
  const exists = await User.findOne({ where: { email } });
  if (exists) throw new ErrorResponse('Email already in use', 409);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, firstName, lastName, passwordHash, role: 'customer', status: 'active' });
  const token = signAndSetCookie(res, { id: user.id, role: user.role });
  res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ErrorResponse('Email and password required', 400);
  const user = await User.findOne({ where: { email } });
  if (!user || !user.passwordHash) throw new ErrorResponse('Invalid credentials', 401);
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ErrorResponse('Invalid credentials', 401);
  const token = signAndSetCookie(res, { id: user.id, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ErrorResponse('Unauthorized', 401);
  const json = user.toJSON();
  delete json.passwordHash;
  delete json.oauthSubject;
  res.json(json);
});

// POST /api/auth/change-password  (auth required)
export const changePassword = asyncHandler(async (req, res) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) throw new ErrorResponse('oldPassword and newPassword required', 400);
  if (!user.passwordHash) throw new ErrorResponse('Password change not allowed for OAuth-only accounts', 400);
  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) throw new ErrorResponse('Old password incorrect', 401);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await user.update({ passwordHash });
  res.json({ message: 'Password updated' });
});

// POST /api/auth/reset/request
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ErrorResponse('Email required', 400);
  const user = await User.findOne({ where: { email } });
  // Always respond 200 to avoid user enumeration
  if (!user) return res.json({ message: 'If the email exists, a reset link will be sent' });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await PasswordReset.create({
    userId: user.id,
    tokenHash,
    expiresAt,
    ip: req.ip,
    userAgent: req.get('user-agent') || ''
  });

  // TODO: send email with link: `${CLIENT_URL}/reset-password?token=${rawToken}`
  const DEV = process.env.NODE_ENV !== 'production';
  res.json({
    message: 'If the email exists, a reset link will be sent',
    ...(DEV ? { devToken: rawToken } : {})
  });
});

// POST /api/auth/reset/confirm
export const confirmPasswordReset = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) throw new ErrorResponse('token and newPassword required', 400);

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const pr = await PasswordReset.findOne({ where: { tokenHash } });

  if (!pr || pr.usedAt) throw new ErrorResponse('Invalid token', 400);
  if (new Date(pr.expiresAt).getTime() < Date.now()) throw new ErrorResponse('Token expired', 400);

  const user = await User.findByPk(pr.userId);
  if (!user) throw new ErrorResponse('User not found', 404);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await user.update({ passwordHash });
  await pr.update({ usedAt: new Date() });

  // Optional: invalidate other outstanding tokens for this user
  await PasswordReset.update(
    { usedAt: new Date() },
    { where: { userId: user.id, usedAt: null, id: { $ne: pr.id } } }
  ).catch(() => {});

  res.json({ message: 'Password has been reset' });
});
