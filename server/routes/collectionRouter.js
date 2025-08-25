import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listCollections, getCollection, createCollection, updateCollection, deleteCollection } from '../controllers/collectionController.js';

const collectionRouter = express.Router();

// Public reads
collectionRouter.get('/', listCollections);
collectionRouter.get('/:id', getCollection);

// Protected writes
collectionRouter.post('/', auth, requireAdmin, createCollection);
collectionRouter.put('/:id', auth, requireAdmin, updateCollection);
collectionRouter.delete('/:id', auth, requireAdmin, deleteCollection);

export default collectionRouter;
