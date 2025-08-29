import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  const cookieToken = req.cookies?.token;
  const header = req.headers.authorization;
  const headerToken = header?.startsWith('Bearer ') ? header.split(' ')[1] : undefined;
  // Prefer explicit Bearer header over cookie to respect active client session
  const token = headerToken || cookieToken;

  if (!token) return res.status(401).json({ error: 'Unauthorized. Please sign in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export default auth;
