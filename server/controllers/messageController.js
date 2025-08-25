import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import MessageThread from '../models/MessageThread.js';
import Message from '../models/Message.js';
import Listing from '../models/Listing.js';

export const startThread = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  const listing = await Listing.findByPk(listingId);
  if (!listing) throw new ErrorResponse('Listing not found', 404);
  if (listing.ownerUserId === req.user.id) throw new ErrorResponse('Cannot message your own listing', 400);

  const [thread] = await MessageThread.findOrCreate({
    where: { listingId, buyerUserId: req.user.id, sellerUserId: listing.ownerUserId },
    defaults: { listingId, buyerUserId: req.user.id, sellerUserId: listing.ownerUserId, lastMessageAt: new Date() }
  });
  res.status(201).json(thread);
});

export const listThreads = asyncHandler(async (req, res) => {
  const rows = await MessageThread.findAll({
    where: { [Op.or]: [{ buyerUserId: req.user.id }, { sellerUserId: req.user.id }] },
    order: [['lastMessageAt', 'DESC']]
  });
  res.json(rows);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const thread = await MessageThread.findByPk(id);
  if (!thread) throw new ErrorResponse('Thread not found', 404);
  if (![thread.buyerUserId, thread.sellerUserId].includes(req.user.id)) throw new ErrorResponse('Forbidden', 403);

  const msg = await Message.create({
    threadId: thread.id,
    senderUserId: req.user.id,
    body: req.body.body,
    attachments: req.body.attachments
  });
  await thread.update({ lastMessageAt: new Date() });
  res.status(201).json(msg);
});

export default { startThread, listThreads, sendMessage };
