import CategoryTranslation from '../models/CategoryTranslation.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllCategoryTranslations, getById: getCategoryTranslationById, createOne: createCategoryTranslation, updateOne: updateCategoryTranslation, deleteOne: deleteCategoryTranslation } =
  buildCrud(CategoryTranslation, { modelName: 'CategoryTranslation' });
