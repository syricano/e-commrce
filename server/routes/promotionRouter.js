import express from 'express';
import { auth } from '../middleware/auth.js';
import { bumpListing, listPromotions, updatePromotion } from '../controllers/promotionController.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const promotionRouter = express.Router();
promotionRouter.post('/listings/:id/bump', auth, bumpListing);
// Admin list/update promotions at base path
promotionRouter.get('/', auth, requireAdmin, listPromotions);
promotionRouter.put('/:id', auth, requireAdmin, updatePromotion);
export default promotionRouter;
