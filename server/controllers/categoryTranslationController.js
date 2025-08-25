import CategoryTranslation from '../models/CategoryTranslation.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCategoryTranslations = list(CategoryTranslation);
export const getCategoryTranslation = getById(CategoryTranslation);
export const createCategoryTranslation = createOne(CategoryTranslation);
export const updateCategoryTranslation = updateById(CategoryTranslation);
export const deleteCategoryTranslation = deleteById(CategoryTranslation);

export default { listCategoryTranslations, getCategoryTranslation, createCategoryTranslation, updateCategoryTranslation, deleteCategoryTranslation };
