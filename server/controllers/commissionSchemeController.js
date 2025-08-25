import CommissionScheme from '../models/CommissionScheme.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCommissionSchemes = list(CommissionScheme);
export const getCommissionScheme = getById(CommissionScheme);
export const createCommissionScheme = createOne(CommissionScheme);
export const updateCommissionScheme = updateById(CommissionScheme);
export const deleteCommissionScheme = deleteById(CommissionScheme);

export default { listCommissionSchemes, getCommissionScheme, createCommissionScheme, updateCommissionScheme, deleteCommissionScheme };
