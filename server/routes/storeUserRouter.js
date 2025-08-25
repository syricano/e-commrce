import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listStoreUsers, getStoreUser, createStoreUser, updateStoreUser, deleteStoreUser } from '../controllers/storeUserController.js';

const storeUserRouter = express.Router();

// Public reads
storeUserRouter.get('/', listStoreUsers);
storeUserRouter.get('/:id', getStoreUser);

// Protected writes
storeUserRouter.post('/', auth, requireAdmin, createStoreUser);
storeUserRouter.put('/:id', auth, requireAdmin, updateStoreUser);
storeUserRouter.delete('/:id', auth, requireAdmin, deleteStoreUser);

export default storeUserRouter;
