import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import validate from '../middleware/validateZod.js';
import {
  adminUserRoleStatusSchema,
  adminUserUpdateSchema,
  adminModerateProductSchema,
  adminModerateListingSchema,
  adminReviewReportSchema,
  adminAssignCommissionSchema,
  adminUpdatePayoutStatusSchema,
  adminImpersonateSchema,
} from '../zod/index.js';
import {
  getDashboardStats,
  searchUsers,
  updateUserRoleStatus,
  suspendUser,
  getSellerSettings,
  updateSellerSettings,
} from '../controllers/adminController.js';
import {
  updateUserByAdmin,
  deleteUserByAdmin,
  moderateProduct,
  moderateListing,
  reviewReport,
  assignCommissionScheme,
  updatePayoutStatus,
  impersonate,
  listReports,
} from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.use(auth, requireAdmin);

// Dashboard
adminRouter.get('/dashboard', getDashboardStats);

// Users management
adminRouter.get('/users', searchUsers);
adminRouter.put('/users/:id/role-status', validate.body(adminUserRoleStatusSchema), updateUserRoleStatus);
adminRouter.post('/users/:id/suspend', suspendUser);
adminRouter.put('/users/:id', validate.body(adminUserUpdateSchema), updateUserByAdmin);
adminRouter.delete('/users/:id', deleteUserByAdmin);

// Seller (C2C) checkout settings
adminRouter.get('/users/:id/seller-settings', getSellerSettings);
adminRouter.put('/users/:id/seller-settings', updateSellerSettings);

// Products moderation
adminRouter.post('/products/:id/moderate', validate.body(adminModerateProductSchema), moderateProduct);

// Listings moderation
adminRouter.post('/listings/:id/moderate', validate.body(adminModerateListingSchema), moderateListing);

// Reports
adminRouter.get('/reports', listReports);
adminRouter.post('/reports/:id/review', validate.body(adminReviewReportSchema), reviewReport);

// Stores / commissions
adminRouter.put('/stores/:id/commission', validate.body(adminAssignCommissionSchema), assignCommissionScheme);

// Payouts
adminRouter.put('/payouts/:id/status', validate.body(adminUpdatePayoutStatusSchema), updatePayoutStatus);

// Impersonation
adminRouter.post('/impersonate', validate.body(adminImpersonateSchema), impersonate);

export default adminRouter;
