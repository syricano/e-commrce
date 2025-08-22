import Inventory from '../models/Inventory.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllInventory, getById: getInventoryById, createOne: createInventory, updateOne: updateInventory, deleteOne: deleteInventory } =
  buildCrud(Inventory, { modelName: 'Inventory' });
