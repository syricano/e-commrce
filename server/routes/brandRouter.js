import express from 'express';
import { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand } from '../controllers/brand.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.post('/', auth, requireAdmin, createBrand);
router.put('/:id', auth, requireAdmin, updateBrand);
router.delete('/:id', auth, requireAdmin, deleteBrand);
export default router;
