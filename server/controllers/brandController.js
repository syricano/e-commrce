import Brand from '../models/Brand.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listBrands = list(Brand);
export const getBrand = getById(Brand);
export const createBrand = createOne(Brand);
export const updateBrand = updateById(Brand);
export const deleteBrand = deleteById(Brand);

export default { listBrands, getBrand, createBrand, updateBrand, deleteBrand };
