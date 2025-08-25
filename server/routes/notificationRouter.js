import express from 'express';
import { auth } from '../middleware/auth.js';
import { listMyNotifications, markRead } from '../controllers/notificationController.js';

const notificationRouter = express.Router();
notificationRouter.get('/', auth, listMyNotifications);
notificationRouter.post('/:id/read', auth, markRead);
export default notificationRouter;
