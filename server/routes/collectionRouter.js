import express from 'express';
import { getAllCollections, getCollectionById, createCollection, updateCollection, deleteCollection } from '../controllers/collection.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllCollections);
router.get('/:id', getCollectionById);
router.post('/', auth, requireAdmin, createCollection);
router.put('/:id', auth, requireAdmin, updateCollection);
router.delete('/:id', auth, requireAdmin, deleteCollection);
export default router;
