// server/routes/categoryPublicRouter.js
import express from 'express';
import { listPublic } from '../controllers/categoryPublicController.js';

const categoryPublicRouter = express.Router();
categoryPublicRouter.get('/public', listPublic);

export { categoryPublicRouter };
export default categoryPublicRouter;
