import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Payment from '../models/Payment.js';
import { list, getById, updateById, deleteById } from './crudFactory.js';

// ----------------------------
// Admin CRUD
// ----------------------------
export const listOrders = list(Order);
export const getOrder = getById(Order);
export const updateOrder = updateById(Order);
export const deleteOrder = deleteById(Order);

// ----------------------------
// Create order (logged-in users only)
// ----------------------------
export const createOrder = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new ErrorResponse('Unauthorized', 401);

  const payload = { ...req.body, userId: req.user.id };

  const order = await Order.create(payload);
  res.status(201).json(order);
});

// ----------------------------
// List my orders
// ----------------------------
export const listMyOrders = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new ErrorResponse('Unauthorized', 401);

  const { page = '1', limit = '50' } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const rows = await Order.findAndCountAll({
    where: { userId: req.user.id },
    limit: l,
    offset: (p - 1) * l,
    order: [['placedAt', 'DESC']]
  });

  res.json({ total: rows.count, items: rows.rows });
});

// ----------------------------
// Get my order
// ----------------------------
export const getMyOrder = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new ErrorResponse('Unauthorized', 401);

  // Scope by both id and userId to avoid accidental admin route conflicts
  const row = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!row) throw new ErrorResponse('Not found', 404);

  res.json(row);
});

// ----------------------------
// Pay my order (offline/demo)
// ----------------------------
export const payMyOrder = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new ErrorResponse('Unauthorized', 401);

  const row = await Order.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);

  const userOwnsOrder = row.userId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!userOwnsOrder && !isAdmin) {
    throw new ErrorResponse('Forbidden', 403);
  }

  if (row.paymentStatus === 'paid') return res.status(400).json({ error: 'Already paid' });

  const now = new Date();
  await Payment.create({
    orderId: row.id,
    provider: 'manual',
    transactionId: `manual-${now.getTime()}`,
    status: 'captured',
    amount: row.grandTotalAmount || 0,
    currency: row.currency || 'EUR',
    capturedAt: now,
    rawResponse: { method: 'demo' },
  });

  await row.update({ paymentStatus: 'paid' });
  res.json(row);
});

export default {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  listMyOrders,
  getMyOrder,
  payMyOrder
};
