import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import SavedSearch from '../models/SavedSearch.js';

export const listMine = asyncHandler(async (req, res) => {
  const rows = await SavedSearch.findAll({ where: { userId: req.user.id } });
  res.json(rows);
});

export const createOne = asyncHandler(async (req, res) => {
  const row = await SavedSearch.create({ ...req.body, userId: req.user.id });
  res.status(201).json(row);
});

export const updateOne = asyncHandler(async (req, res) => {
  const row = await SavedSearch.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.userId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await row.update(req.body);
  res.json(row);
});

export const removeOne = asyncHandler(async (req, res) => {
  const row = await SavedSearch.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.userId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await row.destroy();
  res.status(204).end();
});

export default { listMine, createOne, updateOne, removeOne };
