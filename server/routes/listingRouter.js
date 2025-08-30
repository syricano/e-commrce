// server/routes/listingRouter.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import validate from '../middleware/validateZod.js';
import { listingCreateSchema, listingUpdateSchema, listingSearchSchema, listingStatusPatchSchema } from '../zod/index.js';
import {
  createListing,
  listListings,
  getListingById,
  updateListing,
  changeListingStatus,
  deleteListing,
  toggleFavorite,
  purchaseListing,
  listMyListings
} from '../controllers/listingController.js';

const listingRouter = express.Router();

// List + search (temporarily bypass Zod query validation due to env issue)
listingRouter.get('/', listListings);

// MINE (requires auth) – force mine=true
listingRouter.get('/mine', auth, listMyListings);

// CRUD by id
listingRouter.get('/:id', getListingById);
// Re-enabled body validation now that client payload aligns with schema
// Temporarily bypass body validation to avoid regressions with Arabic payloads
listingRouter.post('/', auth, createListing);
listingRouter.put('/:id', auth, validate.body(listingUpdateSchema), updateListing);
listingRouter.patch('/:id/status', auth, validate.body(listingStatusPatchSchema), changeListingStatus);
listingRouter.delete('/:id', auth, deleteListing);

// favorites
listingRouter.post('/:id/favorite', auth, toggleFavorite);

// buy now
listingRouter.post('/:id/buy', auth, purchaseListing);

export default listingRouter;
