import express from 'express';
import { getAllCollectionRules, getCollectionRuleById, createCollectionRule, updateCollectionRule, deleteCollectionRule } from '../controllers/collectionRule.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllCollectionRules);
router.get('/:id', getCollectionRuleById);
router.post('/', auth, requireAdmin, createCollectionRule);
router.put('/:id', auth, requireAdmin, updateCollectionRule);
router.delete('/:id', auth, requireAdmin, deleteCollectionRule);
export default router;
