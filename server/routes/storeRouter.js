import express from 'express';
import { getAllStores, getStoreById, createStore, updateStore, deleteStore } from '../controllers/store.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', auth, requireAdmin, getAllStores);
router.get('/:id', auth, requireAdmin, getStoreById);
router.post('/', auth, requireAdmin, createStore);
router.put('/:id', auth, requireAdmin, updateStore);
router.delete('/:id', auth, requireAdmin, deleteStore);
export default router;
