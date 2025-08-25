import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import C2CTransaction from '../models/C2CTransaction.js';

export const listMine = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '50', 10);
  const { count, rows } = await C2CTransaction.findAndCountAll({
    where: { [Op.or]: [{ buyerUserId: req.user.id }, { sellerUserId: req.user.id }] },
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });
  res.json({ total: count, items: rows });
});

export const getOne = asyncHandler(async (req, res) => {
  const row = await C2CTransaction.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.buyerUserId !== req.user.id && row.sellerUserId !== req.user.id && req.user.role !== 'admin')
    throw new ErrorResponse('Forbidden', 403);
  res.json(row);
});

export const listAll = asyncHandler(async (_req, res) => {
  const rows = await C2CTransaction.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
  res.json(rows);
});

export default { listMine, getOne, listAll };
