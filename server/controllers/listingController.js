import sequelize from '../db/index.js';
import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Listing from '../models/Listing.js';
import ListingTranslation from '../models/ListingTranslation.js';
import ListingMedia from '../models/ListingMedia.js';
import Favorite from '../models/Favorite.js';

export const createListing = asyncHandler(async (req, res) => {
  const { translations, ...data } = req.body;
  const listing = await sequelize.transaction(async (t) => {
    const row = await Listing.create(
      { ...data, ownerUserId: req.user.id, status: 'active', publishedAt: new Date() },
      { transaction: t }
    );
    if (Array.isArray(translations)) {
      for (const tr of translations) {
        await ListingTranslation.create({ ...tr, listingId: row.id }, { transaction: t });
      }
    }
    return row;
  });
  res.status(201).json(listing);
});

export const searchListings = asyncHandler(async (req, res) => {
  const { q, categoryId, minPrice, maxPrice, condition, city, page = '1', limit = '20', sort = 'new' } = req.query;
  const where = { status: 'active' };
  if (categoryId) where.categoryId = categoryId;
  if (minPrice) where.priceAmount = { ...(where.priceAmount || {}), [Op.gte]: +minPrice };
  if (maxPrice) where.priceAmount = { ...(where.priceAmount || {}), [Op.lte]: +maxPrice };
  if (condition) where.condition = condition;
  if (city) where.locationCity = city;

  const like = q ? '%' + q + '%' : null;
  const include = q
    ? [{
        model: ListingTranslation,
        as: 'translations',
        where: { [Op.or]: [{ title: { [Op.iLike]: like } }, { description: { [Op.iLike]: like } }] },
        required: true
      }]
    : [{ model: ListingTranslation, as: 'translations', required: false }];

  const order =
    sort === 'price_asc' ? [['priceAmount', 'ASC']]
    : sort === 'price_desc' ? [['priceAmount', 'DESC']]
    : [['publishedAt', 'DESC']];

  const rows = await Listing.findAndCountAll({
    where, include, order,
    limit: +limit, offset: (+page - 1) * (+limit)
  });
  res.json({ total: rows.count, items: rows.rows });
});

export const getListing = asyncHandler(async (req, res) => {
  const row = await Listing.findByPk(req.params.id, {
    include: [
      { model: ListingTranslation, as: 'translations' },
      { model: ListingMedia, as: 'media' }
    ]
  });
  if (!row) throw new ErrorResponse('Not found', 404);
  res.json(row);
});

export const updateListing = asyncHandler(async (req, res) => {
  const row = await Listing.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.ownerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await row.update(req.body);
  res.json(row);
});

export const patchListingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // active|reserved|sold|expired
  const row = await Listing.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.ownerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await row.update({ status });
  res.json(row);
});

export const destroyListing = asyncHandler(async (req, res) => {
  const row = await Listing.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.ownerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await row.destroy();
  res.status(204).end();
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await Favorite.findOne({ where: { userId: req.user.id, listingId: id } });
  if (exists) { await exists.destroy(); return res.json({ favorited: false }); }
  await Favorite.create({ userId: req.user.id, listingId: id });
  res.json({ favorited: true });
});

export default {
  createListing, searchListings, getListing, updateListing, patchListingStatus, destroyListing, toggleFavorite
};
