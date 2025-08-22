import express from 'express';
import { getAllReviewVotes, getReviewVoteById, createReviewVote, updateReviewVote, deleteReviewVote } from '../controllers/reviewVote.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.get('/', auth, getAllReviewVotes);
router.get('/:id', auth, getReviewVoteById);
router.post('/', auth, createReviewVote);
router.put('/:id', auth, updateReviewVote);
router.delete('/:id', auth, deleteReviewVote);
export default router;
