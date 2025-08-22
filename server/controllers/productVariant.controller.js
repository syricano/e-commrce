import ProductVariant from '../models/ProductVariant.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllProductVariants, getById: getProductVariantById, createOne: createProductVariant, updateOne: updateProductVariant, deleteOne: deleteProductVariant } =
  buildCrud(ProductVariant, { modelName: 'ProductVariant' });
