import Order from '../models/Order.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllOrders, getById: getOrderById, createOne: createOrder, updateOne: updateOrder, deleteOne: deleteOrder } =
  buildCrud(Order, { modelName: 'Order' });
