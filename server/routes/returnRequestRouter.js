import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listReturnRequests, getReturnRequest, createReturnRequest, updateReturnRequest, deleteReturnRequest } from '../controllers/returnRequestController.js';

const returnRequestRouter = express.Router();

// Public reads
returnRequestRouter.get('/', listReturnRequests);
returnRequestRouter.get('/:id', getReturnRequest);

// Protected writes
returnRequestRouter.post('/', auth, requireAdmin, createReturnRequest);
returnRequestRouter.put('/:id', auth, requireAdmin, updateReturnRequest);
returnRequestRouter.delete('/:id', auth, requireAdmin, deleteReturnRequest);

export default returnRequestRouter;
