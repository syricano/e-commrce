import express from 'express';
import { auth } from '../middleware/auth.js';
import { blockUser, unblockUser, listBlocked } from '../controllers/blockController.js';

const blockRouter = express.Router();
blockRouter.get('/', auth, listBlocked);
blockRouter.post('/:userId', auth, blockUser);
blockRouter.delete('/:userId', auth, unblockUser);
export default blockRouter;
