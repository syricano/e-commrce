import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import UserRating from '../models/UserRating.js';
import C2CTransaction from '../models/C2CTransaction.js';

export const createRating = asyncHandler(async (req, res) => {
  const { transactionId, rateeUserId, role, stars, comment } = req.body;
  const tx = await C2CTransaction.findByPk(transactionId);
  if (!tx) throw new ErrorResponse('Transaction not found', 404);
  if (![tx.buyerUserId, tx.sellerUserId].includes(req.user.id)) throw new ErrorResponse('Forbidden', 403);
  const row = await UserRating.create({
    transactionId,
    raterUserId: req.user.id,
    rateeUserId,
    role,
    stars,
    comment,
  });
  res.status(201).json(row);
});

export const listRatingsForUser = asyncHandler(async (req, res) => {
  const out = await UserRating.findAll({
    where: { rateeUserId: req.params.userId },
    order: [['createdAt', 'DESC']],
  });
  res.json(out);
});

export default { createRating, listRatingsForUser };
