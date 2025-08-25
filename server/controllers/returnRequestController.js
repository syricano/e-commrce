import ReturnRequest from '../models/ReturnRequest.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listReturnRequests = list(ReturnRequest);
export const getReturnRequest = getById(ReturnRequest);
export const createReturnRequest = createOne(ReturnRequest);
export const updateReturnRequest = updateById(ReturnRequest);
export const deleteReturnRequest = deleteById(ReturnRequest);

export default { listReturnRequests, getReturnRequest, createReturnRequest, updateReturnRequest, deleteReturnRequest };
