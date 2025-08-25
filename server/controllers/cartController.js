import Cart from '../models/Cart.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCarts = list(Cart);
export const getCart = getById(Cart);
export const createCart = createOne(Cart);
export const updateCart = updateById(Cart);
export const deleteCart = deleteById(Cart);

export default { listCarts, getCart, createCart, updateCart, deleteCart };
