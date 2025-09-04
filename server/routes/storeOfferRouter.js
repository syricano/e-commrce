import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  stats,
  publicIndex,
  publicShow,
  list,
  create,
  updateOne,
  removeOne,
} from '../controllers/storeOfferController.js';

const storeOfferRouter = express.Router();

/* -------- Public -------- */
storeOfferRouter.get('/public', publicIndex);
storeOfferRouter.get('/public/:id', publicShow);
storeOfferRouter.get('/stats', stats);

/* -------- Auth (seller/admin) -------- */
storeOfferRouter.get('/', auth, list);
storeOfferRouter.post('/', auth, create);
storeOfferRouter.put('/:id', auth, updateOne);
storeOfferRouter.delete('/:id', auth, removeOne);

export default storeOfferRouter;
