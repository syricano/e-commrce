import ReviewVote from '../models/ReviewVote.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllReviewVotes, getById: getReviewVoteById, createOne: createReviewVote, updateOne: updateReviewVote, deleteOne: deleteReviewVote } =
  buildCrud(ReviewVote, { modelName: 'ReviewVote' });
