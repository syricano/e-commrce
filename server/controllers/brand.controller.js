import Brand from '../models/Brand.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllBrands, getById: getBrandById, createOne: createBrand, updateOne: updateBrand, deleteOne: deleteBrand } =
  buildCrud(Brand, { modelName: 'Brand' });
