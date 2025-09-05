import express from 'express';
import { ensureCart } from '../middleware/currentCart.js';
import { auth } from '../middleware/auth.js';
import { getCheckoutOptions, placeOrder } from '../controllers/checkoutController.js';

const router = express.Router();

// Read available options for current cart
router.get('/options', ensureCart, getCheckoutOptions);

// Place order from current cart
// Require authentication to place an order (no guest checkout)
router.post('/place', auth, ensureCart, placeOrder);

export default router;
