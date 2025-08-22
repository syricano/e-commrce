import express from 'express';
import { getAllCartItems, getCartItemById, createCartItem, updateCartItem, deleteCartItem } from '../controllers/cartItem.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.get('/', auth, getAllCartItems);
router.get('/:id', auth, getCartItemById);
router.post('/', auth, createCartItem);
router.put('/:id', auth, updateCartItem);
router.delete('/:id', auth, deleteCartItem);
export default router;
