import Payment from '../models/Payment.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllPayments, getById: getPaymentById, createOne: createPayment, updateOne: updatePayment, deleteOne: deletePayment } =
  buildCrud(Payment, { modelName: 'Payment' });
