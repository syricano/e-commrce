import express from 'express';
import { getAllProductTranslations, getProductTranslationById, createProductTranslation, updateProductTranslation, deleteProductTranslation } from '../controllers/productTranslation.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllProductTranslations);
router.get('/:id', getProductTranslationById);
router.post('/', auth, requireAdmin, createProductTranslation);
router.put('/:id', auth, requireAdmin, updateProductTranslation);
router.delete('/:id', auth, requireAdmin, deleteProductTranslation);
export default router;
