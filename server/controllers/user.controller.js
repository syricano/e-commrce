import User from '../models/User.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllUsers, getById: getUserById, createOne: createUser, updateOne: updateUser, deleteOne: deleteUser } =
  buildCrud(User, { modelName: 'User' });
