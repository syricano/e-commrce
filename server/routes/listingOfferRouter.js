import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import {
  createListingOffer, updateListingOffer, deleteListingOffer,
  acceptListingOffer, declineListingOffer, markTransactionStatus,
  listListingOffers, getListingOfferById,
} from '../controllers/listingOfferController.js';

const listingOfferRouter = express.Router();

// Admin reads
listingOfferRouter.get('/', auth, requireAdmin, listListingOffers);
listingOfferRouter.get('/:id', auth, requireAdmin, getListingOfferById);

// Buyer/seller actions
listingOfferRouter.post('/', auth, createListingOffer);
listingOfferRouter.put('/:id', auth, updateListingOffer);
listingOfferRouter.delete('/:id', auth, deleteListingOffer);

listingOfferRouter.post('/:id/accept', auth, acceptListingOffer);
listingOfferRouter.post('/:id/decline', auth, declineListingOffer);

// transaction status by seller/admin
listingOfferRouter.put('/transaction/:id/status', auth, markTransactionStatus);

export default listingOfferRouter;
