import BrandTranslation from '../models/BrandTranslation.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listBrandTranslations = list(BrandTranslation);
export const getBrandTranslation = getById(BrandTranslation);
export const createBrandTranslation = createOne(BrandTranslation);
export const updateBrandTranslation = updateById(BrandTranslation);
export const deleteBrandTranslation = deleteById(BrandTranslation);

export default { listBrandTranslations, getBrandTranslation, createBrandTranslation, updateBrandTranslation, deleteBrandTranslation };
