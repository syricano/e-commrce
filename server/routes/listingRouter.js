import express from 'express';
import { auth } from '../middleware/auth.js';
import validate from '../middleware/validateZod.js';
import { listingCreateSchema, listingUpdateSchema, listingSearchSchema } from '../zod/index.js';
import {
  createListing, searchListings, getListing,
  updateListing, patchListingStatus, destroyListing, toggleFavorite
} from '../controllers/listingController.js';

const listingRouter = express.Router();

listingRouter.get('/', validate.query(listingSearchSchema), searchListings);
listingRouter.get('/:id', getListing);

listingRouter.post('/', auth, validate.body(listingCreateSchema), createListing);
listingRouter.put('/:id', auth, validate.body(listingUpdateSchema), updateListing);
listingRouter.patch('/:id/status', auth, patchListingStatus);
listingRouter.delete('/:id', auth, destroyListing);

listingRouter.post('/:id/favorite', auth, toggleFavorite);

export default listingRouter;
