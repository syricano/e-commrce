import Refund from '../models/Refund.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllRefunds, getById: getRefundById, createOne: createRefund, updateOne: updateRefund, deleteOne: deleteRefund } =
  buildCrud(Refund, { modelName: 'Refund' });
