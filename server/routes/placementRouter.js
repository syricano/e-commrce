import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listPlacements, getPlacement, createPlacement, updatePlacement, deletePlacement } from '../controllers/placementController.js';

const placementRouter = express.Router();

// Public reads
placementRouter.get('/', listPlacements);
placementRouter.get('/:id', getPlacement);

// Protected writes
placementRouter.post('/', auth, requireAdmin, createPlacement);
placementRouter.put('/:id', auth, requireAdmin, updatePlacement);
placementRouter.delete('/:id', auth, requireAdmin, deletePlacement);

export default placementRouter;
