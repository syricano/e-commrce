import express from 'express';
import { getAllPayments, getPaymentById, createPayment, updatePayment, deletePayment } from '../controllers/payment.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
// Payments usually system/admin managed
router.get('/', auth, requireAdmin, getAllPayments);
router.get('/:id', auth, requireAdmin, getPaymentById);
router.post('/', auth, requireAdmin, createPayment);
router.put('/:id', auth, requireAdmin, updatePayment);
router.delete('/:id', auth, requireAdmin, deletePayment);
export default router;
