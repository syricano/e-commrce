import Profile from '../models/Profile.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// GET /api/profiles
export const getAllProfiles = asyncHandler(async (req, res) => {
  const rows = await Profile.findAll({ order: [['id','ASC']] });
  res.json(rows);
});

// GET /api/profiles/:id
export const getProfileById = asyncHandler(async (req, res) => {
  const row = await Profile.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Profile not found', 404);
  res.json(row);
});

// POST /api/profiles
export const createProfile = asyncHandler(async (req, res) => {
  const created = await Profile.create(req.body);
  res.status(201).json(created);
});

// PUT /api/profiles/:id
export const updateProfile = asyncHandler(async (req, res) => {
  const row = await Profile.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Profile not found', 404);
  await row.update(req.body);
  res.json(row);
});

// DELETE /api/profiles/:id
export const deleteProfile = asyncHandler(async (req, res) => {
  const row = await Profile.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Profile not found', 404);
  await row.destroy();
  res.json({ message: 'Profile deleted successfully' });
});
