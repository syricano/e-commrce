import express from 'express';
import { getAllCommissionSchemes, getCommissionSchemeById, createCommissionScheme, updateCommissionScheme, deleteCommissionScheme } from '../controllers/commissionScheme.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', auth, requireAdmin, getAllCommissionSchemes);
router.get('/:id', auth, requireAdmin, getCommissionSchemeById);
router.post('/', auth, requireAdmin, createCommissionScheme);
router.put('/:id', auth, requireAdmin, updateCommissionScheme);
router.delete('/:id', auth, requireAdmin, deleteCommissionScheme);
export default router;
