import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listRefunds, getRefund, createRefund, updateRefund, deleteRefund } from '../controllers/refundController.js';

const refundRouter = express.Router();

// Public reads
refundRouter.get('/', listRefunds);
refundRouter.get('/:id', getRefund);

// Protected writes
refundRouter.post('/', auth, requireAdmin, createRefund);
refundRouter.put('/:id', auth, requireAdmin, updateRefund);
refundRouter.delete('/:id', auth, requireAdmin, deleteRefund);

export default refundRouter;
