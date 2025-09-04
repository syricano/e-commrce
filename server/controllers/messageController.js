import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import MessageThread from '../models/MessageThread.js';
import Message from '../models/Message.js';
import Store from '../models/Store.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Listing from '../models/Listing.js';

export const startThread = asyncHandler(async (req, res) => {
  const { listingId, storeId, orderId, recipientUserId } = req.body || {};

  let sellerUserId = null;
  let threadWhere = null;
  let defaults = null;

  if (listingId != null) {
    const listing = await Listing.findByPk(listingId);
    if (!listing) throw new ErrorResponse('Listing not found', 404);
    if (listing.ownerUserId === req.user.id) throw new ErrorResponse('Cannot message your own listing', 400);

    sellerUserId = listing.ownerUserId;
    threadWhere = { listingId, buyerUserId: req.user.id, sellerUserId };
    defaults = { ...threadWhere, contextType: 'listing', contextId: listingId, lastMessageAt: new Date() };
  } else if (storeId != null) {
    const store = await Store.findByPk(storeId);
    if (!store) throw new ErrorResponse('Store not found', 404);
    if (store.ownerUserId === req.user.id) throw new ErrorResponse('Cannot message your own store', 400);

    sellerUserId = store.ownerUserId;
    threadWhere = { contextType: 'store', contextId: storeId, buyerUserId: req.user.id, sellerUserId };
    defaults = { ...threadWhere, lastMessageAt: new Date() };
  } else if (orderId != null) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new ErrorResponse('Order not found', 404);
    // Determine seller from storeId param or infer when only one store exists in the order
    let sid = storeId;
    if (sid == null) {
      const items = await OrderItem.findAll({ where: { orderId } });
      const storeIds = Array.from(new Set(items.map((it) => Number(it.storeId))));
      if (storeIds.length === 1) sid = storeIds[0];
      else throw new ErrorResponse('Ambiguous seller. Provide storeId', 400);
    }
    const store = await Store.findByPk(sid);
    if (!store) throw new ErrorResponse('Store not found', 404);
    if (store.ownerUserId === req.user.id) throw new ErrorResponse('Cannot message yourself', 400);

    sellerUserId = store.ownerUserId;
    threadWhere = { contextType: 'order', contextId: orderId, buyerUserId: req.user.id, sellerUserId };
    defaults = { ...threadWhere, listingId: null, lastMessageAt: new Date() };
  } else if (recipientUserId != null) {
    const rid = Number(recipientUserId);
    if (!Number.isFinite(rid)) throw new ErrorResponse('Invalid recipientUserId', 400);
    if (rid === req.user.id) throw new ErrorResponse('Cannot message yourself', 400);
    sellerUserId = rid; // we use sellerUserId as the peer for direct threads
    threadWhere = { contextType: 'direct', contextId: rid, buyerUserId: req.user.id, sellerUserId };
    defaults = { ...threadWhere, listingId: null, lastMessageAt: new Date() };
  } else {
    throw new ErrorResponse('listingId, storeId, orderId or recipientUserId required', 400);
  }

  const [thread] = await MessageThread.findOrCreate({ where: threadWhere, defaults });
  const initial = (req.body.message || '').trim();
  if (initial) {
    await Message.create({ threadId: thread.id, senderUserId: req.user.id, body: initial });
    await thread.update({ lastMessageAt: new Date() });
  }
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

export const listMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const thread = await MessageThread.findByPk(id);
  if (!thread) throw new ErrorResponse('Thread not found', 404);
  if (![thread.buyerUserId, thread.sellerUserId].includes(req.user.id)) throw new ErrorResponse('Forbidden', 403);

  const rows = await Message.findAll({ where: { threadId: thread.id }, order: [['id', 'ASC']] });
  res.json(rows);
});

export default { startThread, listThreads, sendMessage, listMessages };
