import OrderItem from '../models/OrderItem.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllOrderItems, getById: getOrderItemById, createOne: createOrderItem, updateOne: updateOrderItem, deleteOne: deleteOrderItem } =
  buildCrud(OrderItem, { modelName: 'OrderItem' });
