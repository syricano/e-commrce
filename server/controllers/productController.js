import Product from '../models/Product.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listProducts = list(Product);
export const getProduct = getById(Product);
export const createProduct = createOne(Product);
export const updateProduct = updateById(Product);
export const deleteProduct = deleteById(Product);

export default { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
