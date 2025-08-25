import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listProductVariants, getProductVariant, createProductVariant, updateProductVariant, deleteProductVariant } from '../controllers/productVariantController.js';

const productVariantRouter = express.Router();

// Public reads
productVariantRouter.get('/', listProductVariants);
productVariantRouter.get('/:id', getProductVariant);

// Protected writes
productVariantRouter.post('/', auth, requireAdmin, createProductVariant);
productVariantRouter.put('/:id', auth, requireAdmin, updateProductVariant);
productVariantRouter.delete('/:id', auth, requireAdmin, deleteProductVariant);

export default productVariantRouter;
