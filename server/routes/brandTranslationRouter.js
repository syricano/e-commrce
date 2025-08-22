import express from 'express';
import { getAllBrandTranslations, getBrandTranslationById, createBrandTranslation, updateBrandTranslation, deleteBrandTranslation } from '../controllers/brandTranslation.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllBrandTranslations);
router.get('/:id', getBrandTranslationById);
router.post('/', auth, requireAdmin, createBrandTranslation);
router.put('/:id', auth, requireAdmin, updateBrandTranslation);
router.delete('/:id', auth, requireAdmin, deleteBrandTranslation);
export default router;
