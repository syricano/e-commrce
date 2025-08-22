import express from 'express';
import { getAllInventory, getInventoryById, createInventory, updateInventory, deleteInventory } from '../controllers/inventory.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin, requireSeller } from '../middleware/roleAuth.js';

const router = express.Router();
// Sellers manage their inventory; admins manage all
router.get('/', getAllInventory);
router.get('/:id', getInventoryById);
router.post('/', auth, requireSeller, createInventory);
router.put('/:id', auth, requireSeller, updateInventory);
router.delete('/:id', auth, requireSeller, deleteInventory);
export default router;
