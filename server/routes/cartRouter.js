// server/routes/cartRouter.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { ensureCart } from '../middleware/currentCart.js';
import {
  listCarts,
  getCart,
  createCart,
  updateCart,
  deleteCart,
  getCurrentCart,
  clearCurrentCart,
  updateCurrentCart,
} from '../controllers/cartController.js';

const cartRouter = express.Router();

// Current cart for guest or logged-in
cartRouter.get('/current', ensureCart, getCurrentCart);
cartRouter.get('/me', ensureCart, getCurrentCart); // alias
cartRouter.delete('/current', ensureCart, clearCurrentCart);
cartRouter.put('/current', ensureCart, updateCurrentCart);

// Legacy/public reads
cartRouter.get('/', listCarts);
cartRouter.get('/:id', getCart);

// Admin writes (unchanged)
cartRouter.post('/', auth, requireAdmin, createCart);
cartRouter.put('/:id', auth, requireAdmin, updateCart);
cartRouter.delete('/:id', auth, requireAdmin, deleteCart);

export default cartRouter;
