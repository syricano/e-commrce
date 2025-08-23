import express from 'express';
import { getAllProfiles, getProfileById, createProfile, updateProfile, deleteProfile } from '../controllers/profile.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Admin-only CRUD for now
router.get('/', auth, requireAdmin, getAllProfiles);
router.get('/:id', auth, requireAdmin, getProfileById);
router.post('/', auth, requireAdmin, createProfile);
router.put('/:id', auth, requireAdmin, updateProfile);
router.delete('/:id', auth, requireAdmin, deleteProfile);

export default router;
