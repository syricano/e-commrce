import express from 'express';
import { getAllCollectionTranslations, getCollectionTranslationById, createCollectionTranslation, updateCollectionTranslation, deleteCollectionTranslation } from '../controllers/collectionTranslation.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllCollectionTranslations);
router.get('/:id', getCollectionTranslationById);
router.post('/', auth, requireAdmin, createCollectionTranslation);
router.put('/:id', auth, requireAdmin, updateCollectionTranslation);
router.delete('/:id', auth, requireAdmin, deleteCollectionTranslation);
export default router;
