import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listAddresses, getAddress, createAddress, updateAddress, deleteAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

// Public reads
addressRouter.get('/', listAddresses);
addressRouter.get('/:id', getAddress);

// Protected writes
addressRouter.post('/', auth, requireAdmin, createAddress);
addressRouter.put('/:id', auth, requireAdmin, updateAddress);
addressRouter.delete('/:id', auth, requireAdmin, deleteAddress);

export default addressRouter;
