import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listCommissionSchemes, getCommissionScheme, createCommissionScheme, updateCommissionScheme, deleteCommissionScheme } from '../controllers/commissionSchemeController.js';

const commissionSchemeRouter = express.Router();

// Public reads
commissionSchemeRouter.get('/', listCommissionSchemes);
commissionSchemeRouter.get('/:id', getCommissionScheme);

// Protected writes
commissionSchemeRouter.post('/', auth, requireAdmin, createCommissionScheme);
commissionSchemeRouter.put('/:id', auth, requireAdmin, updateCommissionScheme);
commissionSchemeRouter.delete('/:id', auth, requireAdmin, deleteCommissionScheme);

export default commissionSchemeRouter;
