import express from 'express';
import { auth } from '../middleware/auth.js';
import validate from '../middleware/validateZod.js';
import { threadCreateSchema, messageCreateSchema } from '../zod/index.js';
import { startThread, listThreads, sendMessage, listMessages, getUnreadCount } from '../controllers/messageController.js';

const threadRouter = express.Router();

threadRouter.get('/', auth, listThreads);
threadRouter.get('/unread-count', auth, getUnreadCount);
threadRouter.post('/', auth, validate.body(threadCreateSchema), startThread);
threadRouter.post('/:id/messages', auth, validate.body(messageCreateSchema), sendMessage);
threadRouter.get('/:id/messages', auth, listMessages);

export default threadRouter;
