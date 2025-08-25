import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listPasswordResets, getPasswordReset, createPasswordReset, updatePasswordReset, deletePasswordReset } from '../controllers/passwordResetController.js';

const passwordResetRouter = express.Router();

// Public reads
passwordResetRouter.get('/', listPasswordResets);
passwordResetRouter.get('/:id', getPasswordReset);

// Protected writes
passwordResetRouter.post('/', auth, requireAdmin, createPasswordReset);
passwordResetRouter.put('/:id', auth, requireAdmin, updatePasswordReset);
passwordResetRouter.delete('/:id', auth, requireAdmin, deletePasswordReset);

export default passwordResetRouter;
