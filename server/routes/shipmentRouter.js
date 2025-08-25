import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listShipments, getShipment, createShipment, updateShipment, deleteShipment } from '../controllers/shipmentController.js';

const shipmentRouter = express.Router();

// Public reads
shipmentRouter.get('/', listShipments);
shipmentRouter.get('/:id', getShipment);

// Protected writes
shipmentRouter.post('/', auth, requireAdmin, createShipment);
shipmentRouter.put('/:id', auth, requireAdmin, updateShipment);
shipmentRouter.delete('/:id', auth, requireAdmin, deleteShipment);

export default shipmentRouter;
