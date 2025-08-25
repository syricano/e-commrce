import Placement from '../models/Placement.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listPlacements = list(Placement);
export const getPlacement = getById(Placement);
export const createPlacement = createOne(Placement);
export const updatePlacement = updateById(Placement);
export const deletePlacement = deleteById(Placement);

export default { listPlacements, getPlacement, createPlacement, updatePlacement, deletePlacement };
