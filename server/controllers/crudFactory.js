import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

export const list = (Model, defaultScope = {}) =>
  asyncHandler(async (req, res) => {
    const { page = '1', limit = '50', ...filters } = req.query;
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const where = { ...defaultScope, ...filters };
    const { count, rows } = await Model.findAndCountAll({
      where,
      limit: l,
      offset: (p - 1) * l,
      order: [['id', 'DESC']],
    });
    res.json({ total: count, items: rows });
  });

export const getById = (Model, include = []) =>
  asyncHandler(async (req, res) => {
    const row = await Model.findByPk(req.params.id, { include });
    if (!row) throw new ErrorResponse('Not found', 404);
    res.json(row);
  });

export const createOne = (Model, preset = {}) =>
  asyncHandler(async (req, res) => {
    const row = await Model.create({ ...req.body, ...preset });
    res.status(201).json(row);
  });

export const updateById = (Model) =>
  asyncHandler(async (req, res) => {
    const row = await Model.findByPk(req.params.id);
    if (!row) throw new ErrorResponse('Not found', 404);
    await row.update(req.body);
    res.json(row);
  });

export const deleteById = (Model) =>
  asyncHandler(async (req, res) => {
    const row = await Model.findByPk(req.params.id);
    if (!row) throw new ErrorResponse('Not found', 404);
    await row.destroy();
    res.status(204).end();
  });
