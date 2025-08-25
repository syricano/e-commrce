import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import {
  getDashboardStats,
  searchUsers,
  updateUserRoleStatus,
  suspendUser,
} from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.use(auth, requireAdmin);

// Dashboard summary
adminRouter.get('/dashboard', getDashboardStats);

// Users management
adminRouter.get('/users', searchUsers);                          // ?q=&role=&status=&page=&limit=
adminRouter.put('/users/:id/role-status', updateUserRoleStatus); // { role?, status? }
adminRouter.post('/users/:id/suspend', suspendUser);             // quick suspend helper

export default adminRouter;
