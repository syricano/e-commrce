import express from 'express';
import { auth } from '../middleware/auth.js';
import { createRating, listRatingsForUser } from '../controllers/ratingController.js';

const ratingRouter = express.Router();
ratingRouter.post('/', auth, createRating);
ratingRouter.get('/user/:userId', listRatingsForUser);
export default ratingRouter;
