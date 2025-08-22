import ReturnRequest from '../models/ReturnRequest.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllReturnRequests, getById: getReturnRequestById, createOne: createReturnRequest, updateOne: updateReturnRequest, deleteOne: deleteReturnRequest } =
  buildCrud(ReturnRequest, { modelName: 'ReturnRequest' });
