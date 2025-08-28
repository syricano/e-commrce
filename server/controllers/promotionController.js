import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import sequelize from '../db/index.js';
import Listing from '../models/Listing.js';
import ListingPromotion from '../models/ListingPromotion.js';

export const bumpListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) throw new ErrorResponse('Not found', 404);
  if (listing.ownerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);

  const row = await sequelize.transaction(async (t) => {
    await listing.update({ publishedAt: new Date() }, { transaction: t });
    return ListingPromotion.create({ listingId: listing.id, type: 'bump', status: 'active' }, { transaction: t });
  });
  res.status(201).json(row);
});

export const listPromotions = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50', status, type, listingId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (listingId) where.listingId = Number(listingId);
  const rows = await ListingPromotion.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: +limit,
    offset: (+page - 1) * (+limit),
  });
  res.json({ total: rows.count, items: rows.rows });
});

export const updatePromotion = asyncHandler(async (req, res) => {
  const row = await ListingPromotion.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  await row.update(req.body);
  res.json(row);
});

export default { bumpListing, listPromotions, updatePromotion };
