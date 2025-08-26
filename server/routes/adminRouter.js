import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import {
  getDashboardStats,
  searchUsers,
  updateUserRoleStatus,
  suspendUser,
} from '../controllers/adminController.js';
import {
  updateUserByAdmin,
  deleteUserByAdmin,
} from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.use(auth, requireAdmin);

// Dashboard
adminRouter.get('/dashboard', getDashboardStats);

// Users management
adminRouter.get('/users', searchUsers);
adminRouter.put('/users/:id/role-status', updateUserRoleStatus);
adminRouter.post('/users/:id/suspend', suspendUser);
adminRouter.put('/users/:id', updateUserByAdmin);
adminRouter.delete('/users/:id', deleteUserByAdmin);

export default adminRouter;
