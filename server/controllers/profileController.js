import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Profile from '../models/Profile.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

// Admin CRUD
export const listProfiles = list(Profile);
export const getProfile = getById(Profile);
export const createProfile = createOne(Profile);
export const updateProfile = updateById(Profile);
export const deleteProfile = deleteById(Profile);

// User self-service
export const getMyProfile = asyncHandler(async (req, res) => {
  const row = await Profile.findOne({ where: { userId: req.user.id } });
  if (!row) throw new ErrorResponse('Not found', 404);
  res.json(row);
});

export const upsertMyProfile = asyncHandler(async (req, res) => {
  const [row, created] = await Profile.findOrCreate({
    where: { userId: req.user.id },
    defaults: { userId: req.user.id, ...req.body }
  });
  if (created) return res.status(201).json(row);
  await row.update({ ...req.body });
  res.json(row);
});

export default {
  listProfiles, getProfile, createProfile, updateProfile, deleteProfile,
  getMyProfile, upsertMyProfile
};
