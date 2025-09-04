import Inventory from '../models/Inventory.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listInventories = list(Inventory);
export const getInventory = getById(Inventory);
export const createInventory = createOne(Inventory);
export const updateInventory = updateById(Inventory);
export const deleteInventory = deleteById(Inventory);

export default { listInventories, getInventory, createInventory, updateInventory, deleteInventory };
