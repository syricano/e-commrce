import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', auth, requireAdmin, createProduct);
router.put('/:id', auth, requireAdmin, updateProduct);
router.delete('/:id', auth, requireAdmin, deleteProduct);
export default router;
