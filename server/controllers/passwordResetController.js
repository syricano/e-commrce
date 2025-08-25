import PasswordReset from '../models/PasswordReset.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listPasswordResets = list(PasswordReset);
export const getPasswordReset = getById(PasswordReset);
export const createPasswordReset = createOne(PasswordReset);
export const updatePasswordReset = updateById(PasswordReset);
export const deletePasswordReset = deleteById(PasswordReset);

export default { listPasswordResets, getPasswordReset, createPasswordReset, updatePasswordReset, deletePasswordReset };
