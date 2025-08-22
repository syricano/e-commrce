import express from 'express';
import { getAllReviews, getReviewById, createReview, updateReview, deleteReview } from '../controllers/review.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.post('/', auth, createReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, requireAdmin, deleteReview);
export default router;
