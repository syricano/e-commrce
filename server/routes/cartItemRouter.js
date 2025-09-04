// server/routes/cartItemRouter.js
import express from 'express';
import { ensureCart } from '../middleware/currentCart.js';
import {
  listMyCartItems,
  addCartItem,
  updateMyCartItem,
  deleteMyCartItem,
} from '../controllers/cartItemController.js';

const cartItemRouter = express.Router();

// Guest or logged-in: all scoped to the current cart via ensureCart
cartItemRouter.get('/', ensureCart, listMyCartItems);
cartItemRouter.post('/', ensureCart, addCartItem);
cartItemRouter.put('/:id', ensureCart, updateMyCartItem);
cartItemRouter.delete('/:id', ensureCart, deleteMyCartItem);

export default cartItemRouter;
