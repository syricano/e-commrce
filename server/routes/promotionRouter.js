import express from 'express';
import { auth } from '../middleware/auth.js';
import { bumpListing } from '../controllers/promotionController.js';

const promotionRouter = express.Router();
promotionRouter.post('/listings/:id/bump', auth, bumpListing);
export default promotionRouter;
