import ReviewVote from '../models/ReviewVote.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listReviewVotes = list(ReviewVote);
export const getReviewVote = getById(ReviewVote);
export const createReviewVote = createOne(ReviewVote);
export const updateReviewVote = updateById(ReviewVote);
export const deleteReviewVote = deleteById(ReviewVote);

export default { listReviewVotes, getReviewVote, createReviewVote, updateReviewVote, deleteReviewVote };
