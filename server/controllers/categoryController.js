import Category from '../models/Category.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCategories = list(Category);
export const getCategory = getById(Category);
export const createCategory = createOne(Category);
export const updateCategory = updateById(Category);
export const deleteCategory = deleteById(Category);

export default { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
