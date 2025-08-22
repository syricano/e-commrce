import express from 'express';
import { getAllCategoryTranslations, getCategoryTranslationById, createCategoryTranslation, updateCategoryTranslation, deleteCategoryTranslation } from '../controllers/categoryTranslation.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllCategoryTranslations);
router.get('/:id', getCategoryTranslationById);
router.post('/', auth, requireAdmin, createCategoryTranslation);
router.put('/:id', auth, requireAdmin, updateCategoryTranslation);
router.delete('/:id', auth, requireAdmin, deleteCategoryTranslation);
export default router;
