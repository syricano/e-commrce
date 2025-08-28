import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { createInquiry, listInquiries, updateInquiry } from '../controllers/partnerController.js';

const partnerRouter = express.Router();

// Public create
partnerRouter.post('/inquiries', createInquiry);

// Admin manage
partnerRouter.get('/inquiries', auth, requireAdmin, listInquiries);
partnerRouter.put('/inquiries/:id', auth, requireAdmin, updateInquiry);

export default partnerRouter;

