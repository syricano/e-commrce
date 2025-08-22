import express from 'express';
import { getAllOrderItems, getOrderItemById, createOrderItem, updateOrderItem, deleteOrderItem } from '../controllers/orderItem.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', auth, getAllOrderItems);
router.get('/:id', auth, getOrderItemById);
router.post('/', auth, createOrderItem);
router.put('/:id', auth, updateOrderItem);
router.delete('/:id', auth, requireAdmin, deleteOrderItem);
export default router;
