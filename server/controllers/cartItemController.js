import CartItem from '../models/CartItem.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCartItems = list(CartItem);
export const getCartItem = getById(CartItem);
export const createCartItem = createOne(CartItem);
export const updateCartItem = updateById(CartItem);
export const deleteCartItem = deleteById(CartItem);

export default { listCartItems, getCartItem, createCartItem, updateCartItem, deleteCartItem };
