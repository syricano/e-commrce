import express from 'express';
import { getAllPlacements, getPlacementById, createPlacement, updatePlacement, deletePlacement } from '../controllers/placement.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllPlacements);
router.get('/:id', getPlacementById);
router.post('/', auth, requireAdmin, createPlacement);
router.put('/:id', auth, requireAdmin, updatePlacement);
router.delete('/:id', auth, requireAdmin, deletePlacement);
export default router;
