import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const productRouter = express.Router();

// Public reads
productRouter.get('/', listProducts);
productRouter.get('/:id', getProduct);

// Protected writes
productRouter.post('/', auth, requireAdmin, createProduct);
productRouter.put('/:id', auth, requireAdmin, updateProduct);
productRouter.delete('/:id', auth, requireAdmin, deleteProduct);

export default productRouter;
