import express from 'express';
import { getAllMedia, getMediaById, createMedia, updateMedia, deleteMedia } from '../controllers/media.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllMedia);
router.get('/:id', getMediaById);
router.post('/', auth, requireAdmin, createMedia);
router.put('/:id', auth, requireAdmin, updateMedia);
router.delete('/:id', auth, requireAdmin, deleteMedia);
export default router;
