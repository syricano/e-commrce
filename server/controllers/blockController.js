import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import BlockedUser from '../models/BlockedUser.js';

export const blockUser = asyncHandler(async (req, res) => {
  if (+req.params.userId === +req.user.id) throw new ErrorResponse('Cannot block yourself', 400);
  const [row] = await BlockedUser.findOrCreate({
    where: { userId: req.user.id, blockedUserId: req.params.userId },
  });
  res.status(201).json(row);
});

export const unblockUser = asyncHandler(async (req, res) => {
  const row = await BlockedUser.findOne({ where: { userId: req.user.id, blockedUserId: req.params.userId } });
  if (!row) throw new ErrorResponse('Not found', 404);
  await row.destroy();
  res.status(204).end();
});

export const listBlocked = asyncHandler(async (req, res) => {
  const rows = await BlockedUser.findAll({ where: { userId: req.user.id } });
  res.json(rows);
});

export default { blockUser, unblockUser, listBlocked };
