import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import {
  listCollectionItems,
  getCollectionItem,
  createCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
} from '../controllers/collectionItemController.js';

const collectionItemRouter = express.Router();

// Admin-only (manual picks are editorial tooling)
collectionItemRouter.get('/', auth, requireAdmin, listCollectionItems);
collectionItemRouter.get('/:id', auth, requireAdmin, getCollectionItem);
collectionItemRouter.post('/', auth, requireAdmin, createCollectionItem);
collectionItemRouter.put('/:id', auth, requireAdmin, updateCollectionItem);
collectionItemRouter.delete('/:id', auth, requireAdmin, deleteCollectionItem);

export default collectionItemRouter;
