import Review from '../models/Review.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllReviews, getById: getReviewById, createOne: createReview, updateOne: updateReview, deleteOne: deleteReview } =
  buildCrud(Review, { modelName: 'Review' });
