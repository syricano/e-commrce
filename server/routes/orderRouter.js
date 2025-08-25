import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import {
  listOrders, getOrder, createOrder, updateOrder, deleteOrder,
  listMyOrders, getMyOrder
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// User read-only purchases
orderRouter.get('/mine', auth, listMyOrders);
orderRouter.get('/:id', auth, getMyOrder);

// Admin full control
orderRouter.get('/', auth, requireAdmin, listOrders);
orderRouter.post('/', auth, requireAdmin, createOrder);
orderRouter.put('/:id', auth, requireAdmin, updateOrder);
orderRouter.delete('/:id', auth, requireAdmin, deleteOrder);

export default orderRouter;
