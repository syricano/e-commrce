import express from 'express';
import { getAllProductVariants, getProductVariantById, createProductVariant, updateProductVariant, deleteProductVariant } from '../controllers/productVariant.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllProductVariants);
router.get('/:id', getProductVariantById);
router.post('/', auth, requireAdmin, createProductVariant);
router.put('/:id', auth, requireAdmin, updateProductVariant);
router.delete('/:id', auth, requireAdmin, deleteProductVariant);
export default router;
