import express from 'express';
import { getAllRefunds, getRefundById, createRefund, updateRefund, deleteRefund } from '../controllers/refund.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
// Admin or support staff
router.get('/', auth, requireAdmin, getAllRefunds);
router.get('/:id', auth, requireAdmin, getRefundById);
router.post('/', auth, requireAdmin, createRefund);
router.put('/:id', auth, requireAdmin, updateRefund);
router.delete('/:id', auth, requireAdmin, deleteRefund);
export default router;
