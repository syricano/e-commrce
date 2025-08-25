import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import {
  listUsers, getUser, createUser, updateUser, deleteUser,
  getMe, updateMe
} from '../controllers/userController.js';

const userRouter = express.Router();

// Self endpoints
userRouter.get('/me', auth, getMe);
userRouter.put('/me', auth, updateMe);

// Admin CRUD
userRouter.get('/', auth, requireAdmin, listUsers);
userRouter.get('/:id', auth, requireAdmin, getUser);
userRouter.post('/', auth, requireAdmin, createUser);
userRouter.put('/:id', auth, requireAdmin, updateUser);
userRouter.delete('/:id', auth, requireAdmin, deleteUser);

export default userRouter;
