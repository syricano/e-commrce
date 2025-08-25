import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listCategoryTranslations, getCategoryTranslation, createCategoryTranslation, updateCategoryTranslation, deleteCategoryTranslation } from '../controllers/categoryTranslationController.js';

const categoryTranslationRouter = express.Router();

// Public reads
categoryTranslationRouter.get('/', listCategoryTranslations);
categoryTranslationRouter.get('/:id', getCategoryTranslation);

// Protected writes
categoryTranslationRouter.post('/', auth, requireAdmin, createCategoryTranslation);
categoryTranslationRouter.put('/:id', auth, requireAdmin, updateCategoryTranslation);
categoryTranslationRouter.delete('/:id', auth, requireAdmin, deleteCategoryTranslation);

export default categoryTranslationRouter;
