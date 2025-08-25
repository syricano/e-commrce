import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listOffers, getOffer, createOffer, updateOffer, deleteOffer } from '../controllers/offerController.js';

const offerRouter = express.Router();

// Public reads
offerRouter.get('/', listOffers);
offerRouter.get('/:id', getOffer);

// Protected writes
offerRouter.post('/', auth, requireAdmin, createOffer);
offerRouter.put('/:id', auth, requireAdmin, updateOffer);
offerRouter.delete('/:id', auth, requireAdmin, deleteOffer);

export default offerRouter;
