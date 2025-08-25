import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Order from '../models/Order.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

// Admin CRUD
export const listOrders = list(Order);
export const getOrder = getById(Order);
export const createOrder = createOne(Order);
export const updateOrder = updateById(Order);
export const deleteOrder = deleteById(Order);

// User: read-only own purchases
export const listMyOrders = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50' } = req.query;
  const rows = await Order.findAndCountAll({
    where: { userId: req.user.id },
    limit: +limit, offset: (+page - 1) * (+limit),
    order: [['placedAt', 'DESC']]
  });
  res.json({ total: rows.count, items: rows.rows });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const row = await Order.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.userId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  res.json(row);
});

export default {
  listOrders, getOrder, createOrder, updateOrder, deleteOrder,
  listMyOrders, getMyOrder
};
