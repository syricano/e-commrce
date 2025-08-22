import Product from '../models/Product.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllProducts, getById: getProductById, createOne: createProduct, updateOne: updateProduct, deleteOne: deleteProduct } =
  buildCrud(Product, { modelName: 'Product' });
