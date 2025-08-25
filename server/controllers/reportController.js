import asyncHandler from '../utils/asyncHandler.js';
import Report from '../models/Report.js';

export const createReport = asyncHandler(async (req, res) => {
  const row = await Report.create({ ...req.body, reporterUserId: req.user.id });
  res.status(201).json(row);
});

export default { createReport };
