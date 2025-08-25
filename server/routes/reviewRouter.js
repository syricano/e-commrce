import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listReviews, getReview, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

// Public reads
reviewRouter.get('/', listReviews);
reviewRouter.get('/:id', getReview);

// Protected writes
reviewRouter.post('/', auth, requireAdmin, createReview);
reviewRouter.put('/:id', auth, requireAdmin, updateReview);
reviewRouter.delete('/:id', auth, requireAdmin, deleteReview);

export default reviewRouter;
