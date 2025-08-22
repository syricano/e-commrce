import BrandTranslation from '../models/BrandTranslation.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllBrandTranslations, getById: getBrandTranslationById, createOne: createBrandTranslation, updateOne: updateBrandTranslation, deleteOne: deleteBrandTranslation } =
  buildCrud(BrandTranslation, { modelName: 'BrandTranslation' });
