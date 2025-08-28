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
  toggleFavorite
} from '../controllers/listingController.js';

const listingRouter = express.Router();

// List + search
listingRouter.get('/', validate.query(listingSearchSchema), listListings);

// MINE (requires auth) – force mine=true
listingRouter.get(
  '/mine',
  auth,
  (req, _res, next) => { req.query.mine = 'true'; next(); },
  validate.query(listingSearchSchema),
  listListings
);

// CRUD by id
listingRouter.get('/:id', getListingById);
listingRouter.post('/', auth, validate.body(listingCreateSchema), createListing);
listingRouter.put('/:id', auth, validate.body(listingUpdateSchema), updateListing);
listingRouter.patch('/:id/status', auth, validate.body(listingStatusPatchSchema), changeListingStatus);
listingRouter.delete('/:id', auth, deleteListing);

// favorites
listingRouter.post('/:id/favorite', auth, toggleFavorite);

export default listingRouter;
