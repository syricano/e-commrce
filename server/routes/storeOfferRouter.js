import express from 'express';
import { auth } from '../middleware/auth.js';
import { ensureSellerAuto } from '../middleware/roleAuth.js';
import { list, create, updateOne, removeOne } from '../controllers/storeOfferController.js';

const router = express.Router();

router.get('/', auth, list);
router.post('/', auth, ensureSellerAuto, create);
router.put('/:id', auth, ensureSellerAuto, updateOne);
router.delete('/:id', auth, ensureSellerAuto, removeOne);

export default router;

