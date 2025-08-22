import express from 'express';
import { getAllShipments, getShipmentById, createShipment, updateShipment, deleteShipment } from '../controllers/shipment.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin, requireSeller } from '../middleware/roleAuth.js';

const router = express.Router();
// Sellers handle their store shipments; admin can manage all
router.get('/', auth, getAllShipments);
router.get('/:id', auth, getShipmentById);
router.post('/', auth, requireSeller, createShipment);
router.put('/:id', auth, requireSeller, updateShipment);
router.delete('/:id', auth, requireAdmin, deleteShipment);
export default router;
