import Category from '../models/Category.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllCategories, getById: getCategoryById, createOne: createCategory, updateOne: updateCategory, deleteOne: deleteCategory } =
  buildCrud(Category, { modelName: 'Category' });
