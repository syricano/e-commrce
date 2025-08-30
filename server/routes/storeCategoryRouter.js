import express from 'express';
import { auth } from '../middleware/auth.js';
import { ensureSellerAuto } from '../middleware/roleAuth.js';
import { list, create, update, remove } from '../controllers/storeCategoryController.js';

const router = express.Router();

router.get('/', auth, list);
router.post('/', auth, ensureSellerAuto, create);
router.put('/:id', auth, ensureSellerAuto, update);
router.delete('/:id', auth, ensureSellerAuto, remove);

export default router;

