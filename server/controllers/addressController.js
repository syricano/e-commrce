import Address from '../models/Address.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listAddresss = list(Address);
export const getAddress = getById(Address);
export const createAddress = createOne(Address);
export const updateAddress = updateById(Address);
export const deleteAddress = deleteById(Address);

export default { listAddresss, getAddress, createAddress, updateAddress, deleteAddress };
