// server/middleware/roleAuth.js
// Everyone authenticated can post Listings. Roles guard admin/staff/merchant areas.

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

// Preconfigured helpers
export const requireAdmin   = requireRole('admin');
export const requireStaff   = requireRole('staff', 'admin');
export const requireSeller  = requireRole('seller', 'staff', 'admin'); // merchant console
export const requireCustomer= requireRole('customer','seller','staff','admin'); // any signed-in shopper

export default { requireRole, requireAuth, requireAdmin, requireStaff, requireSeller, requireCustomer };
