import ProductTranslation from '../models/ProductTranslation.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllProductTranslations, getById: getProductTranslationById, createOne: createProductTranslation, updateOne: updateProductTranslation, deleteOne: deleteProductTranslation } =
  buildCrud(ProductTranslation, { modelName: 'ProductTranslation' });
