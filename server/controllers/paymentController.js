import Payment from '../models/Payment.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listPayments = list(Payment);
export const getPayment = getById(Payment);
export const createPayment = createOne(Payment);
export const updatePayment = updateById(Payment);
export const deletePayment = deleteById(Payment);

export default { listPayments, getPayment, createPayment, updatePayment, deletePayment };
