import Shipment from '../models/Shipment.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listShipments = list(Shipment);
export const getShipment = getById(Shipment);
export const createShipment = createOne(Shipment);
export const updateShipment = updateById(Shipment);
export const deleteShipment = deleteById(Shipment);

export default { listShipments, getShipment, createShipment, updateShipment, deleteShipment };
