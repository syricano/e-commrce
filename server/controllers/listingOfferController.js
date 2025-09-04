// server/controllers/listingOfferController.js
import { Op } from 'sequelize';
import sequelize from '../db/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import { parsePageLimit } from '../utils/paging.js';

import ListingOffer from '../models/ListingOffer.js';
import Listing from '../models/Listing.js';
import C2CTransaction from '../models/C2CTransaction.js';
import BlockedUser from '../models/BlockedUser.js';

export const createListingOffer = asyncHandler(async (req, res) => {
  const { listingId, amount, message } = req.body;
  const listing = await Listing.findByPk(listingId);
  if (!listing || listing.status !== 'active') throw new ErrorResponse('Listing not available', 400);
  if (listing.ownerUserId === req.user.id) throw new ErrorResponse('Cannot bid on your listing', 400);

  const blocked = await BlockedUser.findOne({
    where: {
      [Op.or]: [
        { userId: listing.ownerUserId, blockedUserId: req.user.id },
        { userId: req.user.id, blockedUserId: listing.ownerUserId },
      ],
    },
  });
  if (blocked) throw new ErrorResponse('Interaction blocked', 403);

  const row = await ListingOffer.create({ listingId, buyerUserId: req.user.id, amount, message, status: 'open' });
  res.status(201).json(row);
});

export const listListingOffers = asyncHandler(async (req, res) => {
  const { status, listingId, buyerUserId } = req.query;
  const { page, limit } = parsePageLimit(req.query, 50, 200);
  const where = {};
  if (status) where.status = status;
  if (listingId) where.listingId = Number(listingId);
  if (buyerUserId) where.buyerUserId = Number(buyerUserId);

  const rows = await ListingOffer.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });
  res.json({ total: rows.count, items: rows.rows, page, limit });
});

export const getListingOfferById = asyncHandler(async (req, res) => {
  const row = await ListingOffer.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  res.json(row);
});

export const updateListingOffer = asyncHandler(async (req, res) => {
  const row = await ListingOffer.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.buyerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await row.update(req.body);
  res.json(row);
});

export const deleteListingOffer = asyncHandler(async (req, res) => {
  const row = await ListingOffer.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  if (row.buyerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await row.destroy();
  res.status(204).end();
});

export const acceptListingOffer = asyncHandler(async (req, res) => {
  const offer = await ListingOffer.findByPk(req.params.id);
  if (!offer) throw new ErrorResponse('Offer not found', 404);
  const listing = await Listing.findByPk(offer.listingId);
  if (!listing) throw new ErrorResponse('Listing not found', 404);
  if (listing.ownerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  if (offer.status !== 'open') throw new ErrorResponse('Offer not open', 400);

  const method = req.body.method || 'cash'; // online | cash | third_party
  const tx = await sequelize.transaction(async (t) => {
    await offer.update({ status: 'accepted' }, { transaction: t });
    const status = method === 'online' ? 'awaiting_payment' : 'initiated';
    const created = await C2CTransaction.create(
      {
        listingId: listing.id,
        buyerUserId: offer.buyerUserId,
        sellerUserId: listing.ownerUserId,
        amount: offer.amount,
        currency: listing.currency || 'EUR',
        method,
        status,
      },
      { transaction: t }
    );
    await listing.update({ status: 'reserved' }, { transaction: t });
    return created;
  });

  res.status(201).json(tx);
});

export const declineListingOffer = asyncHandler(async (req, res) => {
  const offer = await ListingOffer.findByPk(req.params.id);
  if (!offer) throw new ErrorResponse('Offer not found', 404);
  const listing = await Listing.findByPk(offer.listingId);
  if (!listing) throw new ErrorResponse('Listing not found', 404);
  if (listing.ownerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);
  await offer.update({ status: 'declined' });
  res.json(offer);
});

export const markTransactionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // awaiting_payment|paid|cancelled|completed|disputed
  const tx = await C2CTransaction.findByPk(req.params.id);
  if (!tx) throw new ErrorResponse('Not found', 404);
  if (tx.sellerUserId !== req.user.id && req.user.role !== 'admin') throw new ErrorResponse('Forbidden', 403);

  await tx.update({ status });
  if (status === 'paid' || status === 'completed') {
    const listing = await Listing.findByPk(tx.listingId);
    if (listing) await listing.update({ status: 'sold' });
  }
  res.json(tx);
});

export default {
  createListingOffer,
  updateListingOffer,
  deleteListingOffer,
  acceptListingOffer,
  declineListingOffer,
  markTransactionStatus,
  listListingOffers,
  getListingOfferById,
};
