import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listBrands, getBrand, createBrand, updateBrand, deleteBrand } from '../controllers/brandController.js';

const brandRouter = express.Router();

// Public reads
brandRouter.get('/', listBrands);
brandRouter.get('/:id', getBrand);

// Protected writes
brandRouter.post('/', auth, requireAdmin, createBrand);
brandRouter.put('/:id', auth, requireAdmin, updateBrand);
brandRouter.delete('/:id', auth, requireAdmin, deleteBrand);

export default brandRouter;
