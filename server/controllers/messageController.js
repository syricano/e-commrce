import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import MessageThread from '../models/MessageThread.js';
import Message from '../models/Message.js';
import Store from '../models/Store.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Listing from '../models/Listing.js';
import ListingTranslation from '../models/ListingTranslation.js';
import { localeFromReq } from '../utils/i18n.js';

export const startThread = asyncHandler(async (req, res) => {
  const { listingId, storeId, orderId, recipientUserId } = req.body || {};

  let sellerUserId = null;
  let threadWhere = null;
  let defaults = null;

  let inferredListingId = null;

  // Prioritize order context if both orderId and listingId are provided
  if (orderId != null) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new ErrorResponse('Order not found', 404);
    const items = await OrderItem.findAll({ where: { orderId } });

    // Prefer explicit storeId if provided
    let sid = storeId != null ? Number(storeId) : null;
    if (sid != null) {
      const store = await Store.findByPk(sid);
      if (!store) throw new ErrorResponse('Store not found', 404);
      if (store.ownerUserId === req.user.id) throw new ErrorResponse('Cannot message yourself', 400);
      sellerUserId = store.ownerUserId;
    } else if (listingId != null) {
      // Disambiguate by listingId if provided
      const listing = await Listing.findByPk(listingId);
      if (!listing) throw new ErrorResponse('Listing not found', 404);
      if (listing.ownerUserId === req.user.id) throw new ErrorResponse('Cannot message yourself', 400);
      sellerUserId = listing.ownerUserId;
      inferredListingId = listing.id;
    } else {
      // Infer from items: single store or single listing owner
      const nonNullStoreIds = Array.from(new Set(items.map((it) => it.storeId).filter((v) => v != null)));
      if (nonNullStoreIds.length === 1) {
        const store = await Store.findByPk(nonNullStoreIds[0]);
        if (!store) throw new ErrorResponse('Store not found', 404);
        if (store.ownerUserId === req.user.id) throw new ErrorResponse('Cannot message yourself', 400);
        sellerUserId = store.ownerUserId;
      } else {
        const listingIds = items.map((it) => it.listingId).filter((v) => v != null);
        const uniqListingIds = Array.from(new Set(listingIds));
        if (uniqListingIds.length !== 1) throw new ErrorResponse('Ambiguous seller. Provide storeId or listingId', 400);
        const listing = await Listing.findByPk(uniqListingIds[0]);
        if (!listing) throw new ErrorResponse('Listing not found', 404);
        if (listing.ownerUserId === req.user.id) throw new ErrorResponse('Cannot message yourself', 400);
        sellerUserId = listing.ownerUserId;
        inferredListingId = listing.id;
      }
    }

    threadWhere = { contextType: 'order', contextId: orderId, buyerUserId: req.user.id, sellerUserId };
    defaults = { ...threadWhere, listingId: inferredListingId || null, lastMessageAt: new Date() };
  } else if (listingId != null) {
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
  // If we inferred a listing but the thread lacks it, backfill for easier UI labeling
  if (inferredListingId && !thread.listingId) await thread.update({ listingId: inferredListingId });
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
  // Enrich with listing title and order number for better UI labels
  const locale = localeFromReq(req, 'ar');
  const items = rows.map((r) => r.toJSON());
  const listingIds = Array.from(new Set(items.map((it) => it.listingId || (it.contextType === 'listing' ? it.contextId : null)).filter(Boolean)));
  const orderIds = Array.from(new Set(items.filter((it) => it.contextType === 'order').map((it) => it.contextId)));

  const listingTrs = listingIds.length
    ? await ListingTranslation.findAll({ where: { listingId: { [Op.in]: listingIds }, locale: { [Op.in]: [locale, 'en', 'ar'] } }, order: [['locale', 'ASC']] })
    : [];
  const listingTitleMap = new Map();
  for (const tr of listingTrs) {
    const lid = tr.listingId;
    // Prefer exact locale; keep the first seen as best, overwrite only if exact match
    if (!listingTitleMap.has(lid) || tr.locale === locale) listingTitleMap.set(lid, tr.title || tr.name || '');
  }

  const orders = orderIds.length
    ? await Order.findAll({ where: { id: { [Op.in]: orderIds } }, attributes: ['id', 'number'] })
    : [];
  const orderNumMap = new Map(orders.map((o) => [o.id, o.number]));

  const enriched = items.map((it) => {
    const lid = it.listingId || (it.contextType === 'listing' ? it.contextId : null);
    const title = lid ? listingTitleMap.get(lid) : undefined;
    const ordNum = it.contextType === 'order' ? orderNumMap.get(it.contextId) : undefined;
    return { ...it, listingTitle: title, orderNumber: ordNum };
  });

  res.json(enriched);
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

  // Mark messages not sent by the current user as read
  await Message.update(
    { readAt: new Date() },
    { where: { threadId: thread.id, senderUserId: { [Op.ne]: req.user.id }, readAt: null } }
  );

  const rows = await Message.findAll({ where: { threadId: thread.id }, order: [['id', 'ASC']] });
  res.json(rows);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  // Count messages in threads where the user is a participant, not authored by the user, with null readAt
  const threads = await MessageThread.findAll({
    where: { [Op.or]: [{ buyerUserId: req.user.id }, { sellerUserId: req.user.id }] },
    attributes: ['id'],
  });
  const threadIds = threads.map((t) => t.id);
  if (threadIds.length === 0) return res.json({ count: 0 });
  const count = await Message.count({ where: { threadId: { [Op.in]: threadIds }, senderUserId: { [Op.ne]: req.user.id }, readAt: null } });
  res.json({ count });
});

export default { startThread, listThreads, sendMessage, listMessages, getUnreadCount };
