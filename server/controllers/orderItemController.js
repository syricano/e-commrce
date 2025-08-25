import OrderItem from '../models/OrderItem.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listOrderItems = list(OrderItem);
export const getOrderItem = getById(OrderItem);
export const createOrderItem = createOne(OrderItem);
export const updateOrderItem = updateById(OrderItem);
export const deleteOrderItem = deleteById(OrderItem);

export default { listOrderItems, getOrderItem, createOrderItem, updateOrderItem, deleteOrderItem };
