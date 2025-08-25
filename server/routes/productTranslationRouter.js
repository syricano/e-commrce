import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listProductTranslations, getProductTranslation, createProductTranslation, updateProductTranslation, deleteProductTranslation } from '../controllers/productTranslationController.js';

const productTranslationRouter = express.Router();

// Public reads
productTranslationRouter.get('/', listProductTranslations);
productTranslationRouter.get('/:id', getProductTranslation);

// Protected writes
productTranslationRouter.post('/', auth, requireAdmin, createProductTranslation);
productTranslationRouter.put('/:id', auth, requireAdmin, updateProductTranslation);
productTranslationRouter.delete('/:id', auth, requireAdmin, deleteProductTranslation);

export default productTranslationRouter;
