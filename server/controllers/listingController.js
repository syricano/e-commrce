import sequelize from '../db/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Listing from '../models/Listing.js';
import ListingTranslation from '../models/ListingTranslation.js';
import ListingMedia from '../models/ListingMedia.js';
import C2CTransaction from '../models/C2CTransaction.js';
import BlockedUser from '../models/BlockedUser.js';
import helpers, {
  slugify,
  detectOwnerAttr,
  isAdmin,
  assignOwner,
  normalizeLatLngPatch,
} from '../middleware/entityUtils.js';
import { Op } from 'sequelize';

// ---------- Helpers ----------
const simpleSlug = (s) => helpers.ensureSlug(s, 'l');

// ---------- Controllers ----------
export const createListing = asyncHandler(async (req, res) => {
  if (!req.user) throw new ErrorResponse('Unauthorized', 401);
  const { translations = [], ...data } = req.sanitized?.body || req.body || {};

  const ownerKey = assignOwner(Listing, data, req.user);

  if (!data.status) data.status = 'active';
  if (data.status === 'active' && !data.publishedAt) data.publishedAt = new Date();

  const row = await sequelize.transaction(async (t) => {
    const created = await Listing.create(data, { transaction: t });
    if (Array.isArray(translations)) {
      for (const tr of translations) {
        const payload = {
          ...tr,
          listingId: created.id,
          slug: tr.slug || simpleSlug(tr.title),
        };
        await ListingTranslation.create(payload, { transaction: t });
      }
    }
    return created;
  });

  return res.status(201).json(row);
});

export const getListing = asyncHandler(async (req, res) => {
  const item = await Listing.findByPk(req.params.id, {
    include: [
      { model: ListingTranslation, as: 'translations', required: false },
      { model: ListingMedia, as: 'media', required: false },
    ],
  });
  if (!item) return res.status(404).json({ message: 'Not found' });

  if (!['active', 'reserved'].includes(item.status)) {
    const ownerKey = detectOwnerAttr(Listing) || 'ownerUserId';
    const isOwner = req.user?.id === item[ownerKey];
    if (!isOwner && !isAdmin(req.user)) return res.status(404).json({ message: 'Not found' });
  }

  return res.json({ ...item.toJSON(), reservedBadge: item.status === 'reserved' });
});

export const searchListings = asyncHandler(async (req, res) => {
  const q = req.sanitized?.query || req.query || {};
  const {
    page = 1,
    limit = 20,
    mine,
    type,
    categoryId,
    city,
    minPrice,
    maxPrice,
    status,
    sort,
    attrs,
    id,
    ownerUserId,
    title,
  } = q;

  const where = {};
  const ownerKey = detectOwnerAttr(Listing) || 'ownerUserId';

  if (id) where.id = Number(id);
  if (ownerUserId) where[ownerKey] = Number(ownerUserId);

  if (status) {
    where.status = status;
  } else {
    const mineBool = typeof mine === 'string' ? mine === 'true' : !!mine;
    if (!mineBool && !isAdmin(req.user)) where.status = 'active';
  }

  const mineBool = typeof mine === 'string' ? mine === 'true' : !!mine;
  if (mineBool) {
    if (!req.user?.id) return res.status(401).json({ message: 'Login required for mine=true' });
    where[ownerKey] = req.user.id;
  }

  if (type) where.type = type;
  if (categoryId) where.categoryId = Number(categoryId);
  if (city) where.locationCity = city;
  if (minPrice != null || maxPrice != null) {
    where.priceAmount = {};
    if (minPrice != null) where.priceAmount[Op.gte] = Number(minPrice);
    if (maxPrice != null) where.priceAmount[Op.lte] = Number(maxPrice);
  }

  if (attrs) {
    try {
      const obj = typeof attrs === 'string' ? JSON.parse(attrs) : attrs;
      if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
        where.metadata = { ...(where.metadata || {}), [Op.contains]: obj };
      }
    } catch {}
  }

  const order =
    sort === 'price_asc'
      ? [['priceAmount', 'ASC']]
      : sort === 'price_desc'
      ? [['priceAmount', 'DESC']]
      : sort === 'popular'
      ? [['views', 'DESC']]
      : [['createdAt', 'DESC']];

  const include = [
    { model: ListingMedia, as: 'media', required: false },
  ];
  if (title) {
    include.unshift({
      model: ListingTranslation,
      as: 'translations',
      required: true,
      where: { title: { [Op.iLike]: `%${String(title).trim()}%` } },
    });
  } else {
    include.unshift({ model: ListingTranslation, as: 'translations', required: false });
  }

  const rows = await Listing.findAndCountAll({
    where,
    include,
    order,
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    distinct: true,
  });

  return res.json({ page: Number(page), limit: Number(limit), total: rows.count, items: rows.rows });
});

export const listMyListings = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new ErrorResponse('Unauthorized', 401);
  const { page = '1', limit = '50', status } = req.query || {};
  const ownerKey = detectOwnerAttr(Listing) || 'ownerUserId';
  const where = { [ownerKey]: req.user.id };
  if (status) where.status = status;

  const rows = await Listing.findAndCountAll({
    where,
    include: [
      { model: ListingTranslation, as: 'translations', required: false },
      { model: ListingMedia, as: 'media', required: false },
    ],
    order: [['createdAt', 'DESC']],
    limit: Number(limit) || 50,
    offset: ((Number(page) || 1) - 1) * (Number(limit) || 50),
    distinct: true,
  });
  res.json({ page: Number(page) || 1, limit: Number(limit) || 50, total: rows.count, items: rows.rows });
});

export const updateListing = asyncHandler(async (req, res) => {
  const row = await Listing.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  const ownerKey = detectOwnerAttr(Listing) || 'ownerUserId';
  if (row[ownerKey] !== req.user.id && !isAdmin(req.user)) throw new ErrorResponse('Forbidden', 403);

  const payload = normalizeLatLngPatch({ ...(req.sanitized?.body || req.body || {}) });
  await row.update(payload);
  return res.json(row);
});

export const patchListingStatus = asyncHandler(async (req, res) => {
  const { status } = req.sanitized?.body || req.body || {};
  const row = await Listing.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  const ownerKey = detectOwnerAttr(Listing) || 'ownerUserId';
  if (row[ownerKey] !== req.user.id && !isAdmin(req.user)) throw new ErrorResponse('Forbidden', 403);

  const patch = { status };
  if (status === 'reserved') patch.reservedAt = new Date();
  if (status === 'active') {
    patch.reservedAt = null;
    patch.publishedAt = new Date();
  }
  await row.update(patch);
  return res.json(row);
});

export const destroyListing = asyncHandler(async (req, res) => {
  const row = await Listing.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  const ownerKey = detectOwnerAttr(Listing) || 'ownerUserId';
  if (row[ownerKey] !== req.user.id && !isAdmin(req.user)) throw new ErrorResponse('Forbidden', 403);
  await row.destroy();
  return res.status(204).end();
});

export const toggleFavorite = asyncHandler(async (_req, res) => {
  return res.json({ ok: true });
});

export const buyNow = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new ErrorResponse('Unauthorized', 401);
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) throw new ErrorResponse('Not found', 404);
  if (listing.ownerUserId === req.user.id) throw new ErrorResponse('Cannot buy your own listing', 400);
  if (listing.status !== 'active') throw new ErrorResponse('Listing not available', 400);
  if (!listing.allowCheckout) throw new ErrorResponse('Checkout not enabled for this listing', 400);

  const blocked = await BlockedUser.findOne({
    where: {
      [Op.or]: [
        { userId: listing.ownerUserId, blockedUserId: req.user.id },
        { userId: req.user.id, blockedUserId: listing.ownerUserId },
      ],
    },
  });
  if (blocked) throw new ErrorResponse('Interaction blocked', 403);

  const tx = await sequelize.transaction(async (t) => {
    await listing.update({ status: 'reserved' }, { transaction: t });
    const created = await C2CTransaction.create(
      {
        listingId: listing.id,
        buyerUserId: req.user.id,
        sellerUserId: listing.ownerUserId,
        amount: listing.priceAmount,
        currency: listing.currency || 'EUR',
        method: 'online',
        status: 'awaiting_payment',
      },
      { transaction: t }
    );
    return created;
  });

  return res.status(201).json(tx);
});

export const getListingById = getListing;
export const listListings = searchListings;
export const changeListingStatus = patchListingStatus;
export const deleteListing = destroyListing;
export const purchaseListing = buyNow;

export default {
  createListing,
  searchListings: listListings,
  getListing: getListingById,
  updateListing,
  patchListingStatus: changeListingStatus,
  destroyListing: deleteListing,
  toggleFavorite,
  buyNow: purchaseListing,
};
