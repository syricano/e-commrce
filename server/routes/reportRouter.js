import express from 'express';
import { auth } from '../middleware/auth.js';
import validate from '../middleware/validateZod.js';
import { reportCreateSchema } from '../zod/index.js';
import { createReport } from '../controllers/reportController.js';

const reportRouter = express.Router();

reportRouter.post('/', auth, validate.body(reportCreateSchema), createReport);

export default reportRouter;
