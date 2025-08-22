import Cart from '../models/Cart.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllCarts, getById: getCartById, createOne: createCart, updateOne: updateCart, deleteOne: deleteCart } =
  buildCrud(Cart, { modelName: 'Cart' });
