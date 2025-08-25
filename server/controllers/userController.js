import User from '../models/User.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listUsers = list(User);
export const getUser = getById(User);
export const createUser = createOne(User);
export const updateUser = updateById(User);
export const deleteUser = deleteById(User);

export default { listUsers, getUser, createUser, updateUser, deleteUser };
