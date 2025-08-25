import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listBrandTranslations, getBrandTranslation, createBrandTranslation, updateBrandTranslation, deleteBrandTranslation } from '../controllers/brandTranslationController.js';

const brandTranslationRouter = express.Router();

// Public reads
brandTranslationRouter.get('/', listBrandTranslations);
brandTranslationRouter.get('/:id', getBrandTranslation);

// Protected writes
brandTranslationRouter.post('/', auth, requireAdmin, createBrandTranslation);
brandTranslationRouter.put('/:id', auth, requireAdmin, updateBrandTranslation);
brandTranslationRouter.delete('/:id', auth, requireAdmin, deleteBrandTranslation);

export default brandTranslationRouter;
