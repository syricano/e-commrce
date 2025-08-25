import ProductTranslation from '../models/ProductTranslation.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listProductTranslations = list(ProductTranslation);
export const getProductTranslation = getById(ProductTranslation);
export const createProductTranslation = createOne(ProductTranslation);
export const updateProductTranslation = updateById(ProductTranslation);
export const deleteProductTranslation = deleteById(ProductTranslation);

export default { listProductTranslations, getProductTranslation, createProductTranslation, updateProductTranslation, deleteProductTranslation };
