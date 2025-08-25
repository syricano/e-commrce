import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listCartItems, getCartItem, createCartItem, updateCartItem, deleteCartItem } from '../controllers/cartItemController.js';

const cartItemRouter = express.Router();

// Public reads
cartItemRouter.get('/', listCartItems);
cartItemRouter.get('/:id', getCartItem);

// Protected writes
cartItemRouter.post('/', auth, requireAdmin, createCartItem);
cartItemRouter.put('/:id', auth, requireAdmin, updateCartItem);
cartItemRouter.delete('/:id', auth, requireAdmin, deleteCartItem);

export default cartItemRouter;
