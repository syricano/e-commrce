import express from 'express';
import { getAllOffers, getOfferById, createOffer, updateOffer, deleteOffer } from '../controllers/offer.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin, requireSeller } from '../middleware/roleAuth.js';

const router = express.Router();
// Sellers can manage their offers; admins can manage all
router.get('/', getAllOffers);
router.get('/:id', getOfferById);
router.post('/', auth, requireSeller, createOffer);
router.put('/:id', auth, requireSeller, updateOffer);
router.delete('/:id', auth, requireSeller, deleteOffer);
export default router;
