import express from 'express';
import { getAllStoreUsers, getStoreUserById, createStoreUser, updateStoreUser, deleteStoreUser } from '../controllers/storeUser.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', auth, requireAdmin, getAllStoreUsers);
router.get('/:id', auth, requireAdmin, getStoreUserById);
router.post('/', auth, requireAdmin, createStoreUser);
router.put('/:id', auth, requireAdmin, updateStoreUser);
router.delete('/:id', auth, requireAdmin, deleteStoreUser);
export default router;
