import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listCollectionTranslations, getCollectionTranslation, createCollectionTranslation, updateCollectionTranslation, deleteCollectionTranslation } from '../controllers/collectionTranslationController.js';

const collectionTranslationRouter = express.Router();

// Public reads
collectionTranslationRouter.get('/', listCollectionTranslations);
collectionTranslationRouter.get('/:id', getCollectionTranslation);

// Protected writes
collectionTranslationRouter.post('/', auth, requireAdmin, createCollectionTranslation);
collectionTranslationRouter.put('/:id', auth, requireAdmin, updateCollectionTranslation);
collectionTranslationRouter.delete('/:id', auth, requireAdmin, deleteCollectionTranslation);

export default collectionTranslationRouter;
