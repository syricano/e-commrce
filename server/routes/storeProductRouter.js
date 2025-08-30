import express from 'express';
import { auth } from '../middleware/auth.js';
import { ensureSellerAuto } from '../middleware/roleAuth.js';
import { list, create, addMedia, updateOne, removeOne, removeMedia } from '../controllers/storeProductController.js';

const router = express.Router();

router.get('/', auth, list);
router.post('/', auth, ensureSellerAuto, create);
router.post('/:id/media', auth, ensureSellerAuto, addMedia);
router.put('/:id', auth, ensureSellerAuto, updateOne);
router.delete('/:id', auth, ensureSellerAuto, removeOne);
router.delete('/:id/media/:mediaId', auth, ensureSellerAuto, removeMedia);

export default router;
