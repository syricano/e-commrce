import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', auth, requireAdmin, getAllUsers);
router.get('/:id', auth, requireAdmin, getUserById);
router.post('/', auth, requireAdmin, createUser);
router.put('/:id', auth, requireAdmin, updateUser);
router.delete('/:id', auth, requireAdmin, deleteUser);
export default router;
