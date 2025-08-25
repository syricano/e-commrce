import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listOrderItems, getOrderItem, createOrderItem, updateOrderItem, deleteOrderItem } from '../controllers/orderItemController.js';

const orderItemRouter = express.Router();

// Public reads
orderItemRouter.get('/', listOrderItems);
orderItemRouter.get('/:id', getOrderItem);

// Protected writes
orderItemRouter.post('/', auth, requireAdmin, createOrderItem);
orderItemRouter.put('/:id', auth, requireAdmin, updateOrderItem);
orderItemRouter.delete('/:id', auth, requireAdmin, deleteOrderItem);

export default orderItemRouter;
