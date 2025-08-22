import CommissionScheme from '../models/CommissionScheme.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllCommissionSchemes, getById: getCommissionSchemeById, createOne: createCommissionScheme, updateOne: updateCommissionScheme, deleteOne: deleteCommissionScheme } =
  buildCrud(CommissionScheme, { modelName: 'CommissionScheme' });
