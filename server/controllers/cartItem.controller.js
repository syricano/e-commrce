import CartItem from '../models/CartItem.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllCartItems, getById: getCartItemById, createOne: createCartItem, updateOne: updateCartItem, deleteOne: deleteCartItem } =
  buildCrud(CartItem, { modelName: 'CartItem' });
