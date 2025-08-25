import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Notification from '../models/Notification.js';

export const listMyNotifications = asyncHandler(async (req, res) => {
  const rows = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });
  res.json(rows);
});

export const markRead = asyncHandler(async (req, res) => {
  const row = await Notification.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.userId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await row.update({ readAt: new Date() });
  res.json(row);
});

export default { listMyNotifications, markRead };
