import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

// Admin CRUD
export const listUsers  = list(User);
export const getUser    = getById(User);
export const createUser = createOne(User);
export const updateUser = updateById(User);
export const deleteUser = deleteById(User);

// Self: read own account
export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) throw new ErrorResponse('Unauthorized', 401);
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    status: req.user.status,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    phone: req.user.phone,
  });
});

// Self: update own basic account fields
export const updateMe = asyncHandler(async (req, res) => {
  const row = await User.findByPk(req.user.id);
  if (!row) throw new ErrorResponse('User not found', 404);

  const patch = {
    firstName: req.body.firstName ?? row.firstName,
    lastName:  req.body.lastName  ?? row.lastName,
    phone:     req.body.phone     ?? row.phone,
  };
  await row.update(patch);
  res.json({
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
  });
});

export default {
  listUsers, getUser, createUser, updateUser, deleteUser, getMe, updateMe
};
