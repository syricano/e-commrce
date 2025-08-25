import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listPayouts, getPayout, createPayout, updatePayout, deletePayout } from '../controllers/payoutController.js';

const payoutRouter = express.Router();

// Public reads
payoutRouter.get('/', listPayouts);
payoutRouter.get('/:id', getPayout);

// Protected writes
payoutRouter.post('/', auth, requireAdmin, createPayout);
payoutRouter.put('/:id', auth, requireAdmin, updatePayout);
payoutRouter.delete('/:id', auth, requireAdmin, deletePayout);

export default payoutRouter;
