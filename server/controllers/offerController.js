import Offer from '../models/Offer.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';
import asyncHandler from '../utils/asyncHandler.js';

// Admin/seller generic list (kept)
export const listOffers = list(Offer);

// Public list: whitelist filters and default to active offers only
export const listOffersPublic = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50', storeId, variantId, isActive } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const where = {};
  if (storeId) where.storeId = Number(storeId);
  if (variantId) where.variantId = Number(variantId);
  if (isActive != null) where.isActive = String(isActive) !== 'false';
  if (isActive == null) where.isActive = true; // default

  const { count, rows } = await Offer.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: l,
    offset: (p - 1) * l,
  });

  res.json({ total: count, items: rows });
});

export const getOffer = getById(Offer);
export const createOffer = createOne(Offer);
export const updateOffer = updateById(Offer);
export const deleteOffer = deleteById(Offer);

export default {
  listOffers,
  listOffersPublic,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
};
