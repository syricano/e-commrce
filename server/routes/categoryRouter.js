import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listCategorys, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';

const categoryRouter = express.Router();

// Public reads
categoryRouter.get('/', listCategorys);
categoryRouter.get('/:id', getCategory);

// Protected writes
categoryRouter.post('/', auth, requireAdmin, createCategory);
categoryRouter.put('/:id', auth, requireAdmin, updateCategory);
categoryRouter.delete('/:id', auth, requireAdmin, deleteCategory);

export default categoryRouter;
