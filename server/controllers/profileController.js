import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Profile from '../models/Profile.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

// Admin CRUD (by profile id)
export const listProfiles = list(Profile);
export const getProfile   = getById(Profile);
export const createProfile= createOne(Profile);
export const updateProfile= updateById(Profile);
export const deleteProfile= deleteById(Profile);

// Self service (/profiles/me)
export const getMyProfile = asyncHandler(async (req, res) => {
  const [row, created] = await Profile.findOrCreate({
    where: { userId: req.user.id },
    defaults: { userId: req.user.id },
  });
  res.status(created ? 201 : 200).json(row);
});

export const upsertMyProfile = asyncHandler(async (req, res) => {
  const [row, created] = await Profile.findOrCreate({
    where: { userId: req.user.id },
    defaults: { userId: req.user.id, ...req.body }
  });
  if (!created) await row.update({ ...req.body });
  res.status(created ? 201 : 200).json(row);
});

// Admin: load/update profile BY USER ID (matches your client calls /profiles/:userId)
export const getProfileByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const row = await Profile.findOne({ where: { userId } });
  if (!row) throw new ErrorResponse('Not found', 404);
  res.json(row);
});

export const upsertProfileByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const [row, created] = await Profile.findOrCreate({
    where: { userId },
    defaults: { userId, ...req.body }
  });
  if (!created) await row.update({ ...req.body });
  res.status(created ? 201 : 200).json(row);
});

export default {
  listProfiles, getProfile, createProfile, updateProfile, deleteProfile,
  getMyProfile, upsertMyProfile,
  getProfileByUserId, upsertProfileByUserId
};
