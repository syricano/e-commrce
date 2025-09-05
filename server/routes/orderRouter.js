import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  listMyOrders,
  getMyOrder,
  payMyOrder,
} from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// ----------------------------
// User routes
// ----------------------------
router.post('/', auth, createOrder);                     // Create new order
router.get('/mine', auth, listMyOrders);                // List my orders
router.get('/:id(\\d+)/detail', auth, getMyOrder);     // Get my order by ID
router.post('/:id(\\d+)/pay', auth, payMyOrder);       // Pay my order

// ----------------------------
// Admin routes
// ----------------------------
router.get('/', auth, requireAdmin, listOrders);
router.get('/:id(\\d+)', auth, requireAdmin, getOrder);
router.put('/:id(\\d+)', auth, requireAdmin, updateOrder);
router.delete('/:id(\\d+)', auth, requireAdmin, deleteOrder);

export default router;
