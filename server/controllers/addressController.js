import Address from '../models/Address.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listAddresses = list(Address);
export const getAddress = getById(Address);
export const createAddress = createOne(Address);
export const updateAddress = updateById(Address);
export const deleteAddress = deleteById(Address);

export default { listAddresses, getAddress, createAddress, updateAddress, deleteAddress };
