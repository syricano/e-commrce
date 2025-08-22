import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', auth, requireAdmin, createCategory);
router.put('/:id', auth, requireAdmin, updateCategory);
router.delete('/:id', auth, requireAdmin, deleteCategory);
export default router;
