import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listPayments, getPayment, createPayment, updatePayment, deletePayment } from '../controllers/paymentController.js';

const paymentRouter = express.Router();

// Public reads
paymentRouter.get('/', listPayments);
paymentRouter.get('/:id', getPayment);

// Protected writes
paymentRouter.post('/', auth, requireAdmin, createPayment);
paymentRouter.put('/:id', auth, requireAdmin, updatePayment);
paymentRouter.delete('/:id', auth, requireAdmin, deletePayment);

export default paymentRouter;
