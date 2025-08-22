import Address from '../models/Address.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllAddresses, getById: getAddressById, createOne: createAddress, updateOne: updateAddress, deleteOne: deleteAddress } =
  buildCrud(Address, { modelName: 'Address' });
