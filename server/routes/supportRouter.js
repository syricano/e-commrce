import express from 'express';
import { auth } from '../middleware/auth.js';
import { createSupportRequest } from '../controllers/supportController.js';

const router = express.Router();
router.post('/requests', auth, createSupportRequest);
export default router;

