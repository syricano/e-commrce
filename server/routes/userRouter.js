import express from 'express';
import  auth  from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';

const userRouter = express.Router();

// Public reads
userRouter.get('/', listUsers);
userRouter.get('/:id', getUser);

// Protected writes
userRouter.post('/', auth, requireAdmin, createUser);
userRouter.put('/:id', auth, requireAdmin, updateUser);
userRouter.delete('/:id', auth, requireAdmin, deleteUser);

export default userRouter;
