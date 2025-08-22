import express from 'express';
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder } from '../controllers/order.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
// Customers see their orders; admin gated endpoints can be added later
router.get('/', auth, getAllOrders);
router.get('/:id', auth, getOrderById);
router.post('/', auth, createOrder);
router.put('/:id', auth, updateOrder);
router.delete('/:id', auth, requireAdmin, deleteOrder);
export default router;
