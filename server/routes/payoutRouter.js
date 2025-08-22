import express from 'express';
import { getAllPayouts, getPayoutById, createPayout, updatePayout, deletePayout } from '../controllers/payout.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', auth, requireAdmin, getAllPayouts);
router.get('/:id', auth, requireAdmin, getPayoutById);
router.post('/', auth, requireAdmin, createPayout);
router.put('/:id', auth, requireAdmin, updatePayout);
router.delete('/:id', auth, requireAdmin, deletePayout);
export default router;
