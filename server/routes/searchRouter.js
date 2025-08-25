import express from 'express';
import validate from '../middleware/validateZod.js';
import { unifiedSearchSchema } from '../zod/index.js';
import { unifiedSearch } from '../controllers/searchController.js';

const searchRouter = express.Router();

searchRouter.get('/', validate.query(unifiedSearchSchema), unifiedSearch);

export default searchRouter;
