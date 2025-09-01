import express from 'express';
import { auth } from '../middleware/auth.js';
import { ensureSellerAuto } from '../middleware/roleAuth.js';
import {
  listOffers,
  listOffersPublic,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offerController.js';

const offerRouter = express.Router();

// Public reads
offerRouter.get('/public', listOffersPublic);
offerRouter.get('/', listOffers);
offerRouter.get('/:id', getOffer);

// Protected writes
offerRouter.post('/', auth, ensureSellerAuto, createOffer);
offerRouter.put('/:id', auth, ensureSellerAuto, updateOffer);
offerRouter.delete('/:id', auth, ensureSellerAuto, deleteOffer);

export default offerRouter;
