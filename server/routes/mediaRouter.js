import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listMedia, getMedia, createMedia, updateMedia, deleteMedia } from '../controllers/mediaController.js';

const mediaRouter = express.Router();

// Public reads
mediaRouter.get('/', listMedia);
mediaRouter.get('/:id', getMedia);

// Protected writes
mediaRouter.post('/', auth, requireAdmin, createMedia);
mediaRouter.put('/:id', auth, requireAdmin, updateMedia);
mediaRouter.delete('/:id', auth, requireAdmin, deleteMedia);

export default mediaRouter;
