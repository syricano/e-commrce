// server/middleware/roleAuth.js
// Everyone authenticated can post Listings. Roles guard admin/staff/merchant areas.
import User from '../models/User.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized. Please sign in' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden. Insufficient role' });
    next();
  };
};

// Simple auth-only gate
export const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized. Please sign in' });
  next();
};

// Auto-upgrade to seller on first seller action
export const ensureSellerAuto = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized. Please sign in' });
  if (['seller', 'staff', 'admin'].includes(req.user.role)) return next();
  try {
    await User.update({ role: 'seller' }, { where: { id: req.user.id } });
    req.user.role = 'seller';
    return next();
  } catch (e) {
    return res.status(500).json({ error: 'Failed to upgrade role' });
  }
};

// Preconfigured helpers
export const requireAdmin    = requireRole('admin');
export const requireStaff    = requireRole('staff', 'admin');
export const requireSeller   = requireRole('seller', 'staff', 'admin'); // merchant console
export const requireCustomer = requireRole('customer','seller','staff','admin'); // any signed-in shopper

export default { requireRole, requireAuth, ensureSellerAuto, requireAdmin, requireStaff, requireSeller, requireCustomer };
