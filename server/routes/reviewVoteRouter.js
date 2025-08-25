import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listReviewVotes, getReviewVote, createReviewVote, updateReviewVote, deleteReviewVote } from '../controllers/reviewVoteController.js';

const reviewVoteRouter = express.Router();

// Public reads
reviewVoteRouter.get('/', listReviewVotes);
reviewVoteRouter.get('/:id', getReviewVote);

// Protected writes
reviewVoteRouter.post('/', auth, requireAdmin, createReviewVote);
reviewVoteRouter.put('/:id', auth, requireAdmin, updateReviewVote);
reviewVoteRouter.delete('/:id', auth, requireAdmin, deleteReviewVote);

export default reviewVoteRouter;
