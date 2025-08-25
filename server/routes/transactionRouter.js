import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listMine, getOne, listAll } from '../controllers/transactionController.js';

const transactionRouter = express.Router();

transactionRouter.get('/mine', auth, listMine);
transactionRouter.get('/:id', auth, getOne);
transactionRouter.get('/', auth, requireAdmin, listAll);

export default transactionRouter;
