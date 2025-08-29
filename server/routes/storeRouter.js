import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listStores, getStore, createStore, updateStore, deleteStore } from '../controllers/storeController.js';

const storeRouter = express.Router();

// Public reads
storeRouter.get('/', listStores);
storeRouter.get('/:id', getStore);

// Create store: admin-managed flow (ownerUserId can be set explicitly)
storeRouter.post('/', auth, requireAdmin, createStore);
storeRouter.put('/:id', auth, requireAdmin, updateStore);
storeRouter.delete('/:id', auth, requireAdmin, deleteStore);

export default storeRouter;
