// server/middleware/roleAuth.js
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient role' });
    }
    next();
  };
};

// Preconfigured helpers
export const requireAdmin = requireRole('admin');
export const requireSeller = requireRole('seller');
export const requireStaff = requireRole('staff');
export const requireCustomer = requireRole('customer');
