import express from 'express';
import { auth } from '../middleware/auth.js';
import { ensureSellerAuto } from '../middleware/roleAuth.js';
import { getStore, updateMerchantSettings } from '../controllers/storeController.js';
import { validate } from '../middleware/validateZod.js';
import { merchantSettingsSchema } from '../zod/Schemas.js';

const router = express.Router();

router.get('/:id', auth, ensureSellerAuto, getStore);
router.put('/:id/settings', auth, ensureSellerAuto, validate.body(merchantSettingsSchema), updateMerchantSettings);

export default router;
