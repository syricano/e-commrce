import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { createInquiry, listInquiries, updateInquiry, approveInquiry, declineInquiry } from '../controllers/partnerController.js';

const partnerRouter = express.Router();

// Public create
partnerRouter.post('/inquiries', createInquiry);

// Admin manage
partnerRouter.get('/inquiries', auth, requireAdmin, listInquiries);
partnerRouter.put('/inquiries/:id', auth, requireAdmin, updateInquiry);
partnerRouter.post('/inquiries/:id/approve', auth, requireAdmin, approveInquiry);
partnerRouter.post('/inquiries/:id/decline', auth, requireAdmin, declineInquiry);

export default partnerRouter;
