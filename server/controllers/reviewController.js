import Review from '../models/Review.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listReviews = list(Review);
export const getReview = getById(Review);
export const createReview = createOne(Review);
export const updateReview = updateById(Review);
export const deleteReview = deleteById(Review);

export default { listReviews, getReview, createReview, updateReview, deleteReview };
