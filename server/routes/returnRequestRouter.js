import express from 'express';
import { getAllReturnRequests, getReturnRequestById, createReturnRequest, updateReturnRequest, deleteReturnRequest } from '../controllers/returnRequest.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.get('/', auth, getAllReturnRequests);
router.get('/:id', auth, getReturnRequestById);
router.post('/', auth, createReturnRequest);
router.put('/:id', auth, updateReturnRequest);
router.delete('/:id', auth, deleteReturnRequest);
export default router;
