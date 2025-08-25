import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import validate from '../middleware/validateZod.js';
import { id, /* add a specific schema if you want to validate body */ } from '../zod/index.js';
import {
  listProfiles, getProfile, createProfile, updateProfile, deleteProfile,
  getMyProfile, upsertMyProfile
} from '../controllers/profileController.js';

const profileRouter = express.Router();

// Self-service
profileRouter.get('/me', auth, getMyProfile);
profileRouter.put('/me', auth, upsertMyProfile);

// Admin over everything
profileRouter.get('/', auth, requireAdmin, listProfiles);
profileRouter.get('/:id', auth, requireAdmin, getProfile);
profileRouter.post('/', auth, requireAdmin, createProfile);
profileRouter.put('/:id', auth, requireAdmin, updateProfile);
profileRouter.delete('/:id', auth, requireAdmin, deleteProfile);

export default profileRouter;
