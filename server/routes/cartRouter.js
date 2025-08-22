import express from 'express';
import { getAllCarts, getCartById, createCart, updateCart, deleteCart } from '../controllers/cart.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();
// Typically only the owner should access their cart; keep simple for now
router.get('/', auth, getAllCarts);
router.get('/:id', auth, getCartById);
router.post('/', auth, createCart);
router.put('/:id', auth, updateCart);
router.delete('/:id', auth, deleteCart);
export default router;
