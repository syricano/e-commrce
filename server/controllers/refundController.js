import Refund from '../models/Refund.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listRefunds = list(Refund);
export const getRefund = getById(Refund);
export const createRefund = createOne(Refund);
export const updateRefund = updateById(Refund);
export const deleteRefund = deleteById(Refund);

export default { listRefunds, getRefund, createRefund, updateRefund, deleteRefund };
