import express from 'express';
import { getAllAddresses, getAddressById, createAddress, updateAddress, deleteAddress } from '../controllers/address.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', auth, requireAdmin, getAllAddresses);
router.get('/:id', auth, requireAdmin, getAddressById);
router.post('/', auth, requireAdmin, createAddress);
router.put('/:id', auth, requireAdmin, updateAddress);
router.delete('/:id', auth, requireAdmin, deleteAddress);
export default router;
