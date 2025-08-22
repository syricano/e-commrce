import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

export default function buildCrudControllers(Model, { modelName = 'Record', listDefaultOrder = [['id','ASC']] } = {}) {
  const getAll = asyncHandler(async (req, res) => {
    const { limit, offset, order } = req.query;
    const rows = await Model.findAll({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order: order ? JSON.parse(order) : listDefaultOrder
    });
    res.json(rows);
  });

  const getById = asyncHandler(async (req, res) => {
    const row = await Model.findByPk(req.params.id);
    if (!row) throw new ErrorResponse(`${modelName} not found`, 404);
    res.json(row);
  });

  const createOne = asyncHandler(async (req, res) => {
    const created = await Model.create(req.body);
    res.status(201).json(created);
  });

  const updateOne = asyncHandler(async (req, res) => {
    const row = await Model.findByPk(req.params.id);
    if (!row) throw new ErrorResponse(`${modelName} not found`, 404);
    await row.update(req.body);
    res.json(row);
  });

  const deleteOne = asyncHandler(async (req, res) => {
    const row = await Model.findByPk(req.params.id);
    if (!row) throw new ErrorResponse(`${modelName} not found`, 404);
    await row.destroy();
    res.json({ message: `${modelName} deleted successfully` });
  });

  return { getAll, getById, createOne, updateOne, deleteOne };
}
