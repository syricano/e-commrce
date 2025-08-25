import ProductVariant from '../models/ProductVariant.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listProductVariants = list(ProductVariant);
export const getProductVariant = getById(ProductVariant);
export const createProductVariant = createOne(ProductVariant);
export const updateProductVariant = updateById(ProductVariant);
export const deleteProductVariant = deleteById(ProductVariant);

export default { listProductVariants, getProductVariant, createProductVariant, updateProductVariant, deleteProductVariant };
