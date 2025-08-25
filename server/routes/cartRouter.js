import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listCarts, getCart, createCart, updateCart, deleteCart } from '../controllers/cartController.js';

const cartRouter = express.Router();

// Public reads
cartRouter.get('/', listCarts);
cartRouter.get('/:id', getCart);

// Protected writes
cartRouter.post('/', auth, requireAdmin, createCart);
cartRouter.put('/:id', auth, requireAdmin, updateCart);
cartRouter.delete('/:id', auth, requireAdmin, deleteCart);

export default cartRouter;
