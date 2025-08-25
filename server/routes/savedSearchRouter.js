import express from 'express';
import { auth } from '../middleware/auth.js';
import { listMine, createOne, updateOne, removeOne } from '../controllers/savedSearchController.js';

const savedSearchRouter = express.Router();
savedSearchRouter.get('/', auth, listMine);
savedSearchRouter.post('/', auth, createOne);
savedSearchRouter.put('/:id', auth, updateOne);
savedSearchRouter.delete('/:id', auth, removeOne);
export default savedSearchRouter;
