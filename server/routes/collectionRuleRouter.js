import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listCollectionRules, getCollectionRule, createCollectionRule, updateCollectionRule, deleteCollectionRule } from '../controllers/collectionRuleController.js';

const collectionRuleRouter = express.Router();

// Public reads
collectionRuleRouter.get('/', listCollectionRules);
collectionRuleRouter.get('/:id', getCollectionRule);

// Protected writes
collectionRuleRouter.post('/', auth, requireAdmin, createCollectionRule);
collectionRuleRouter.put('/:id', auth, requireAdmin, updateCollectionRule);
collectionRuleRouter.delete('/:id', auth, requireAdmin, deleteCollectionRule);

export default collectionRuleRouter;
