import Shipment from '../models/Shipment.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllShipments, getById: getShipmentById, createOne: createShipment, updateOne: updateShipment, deleteOne: deleteShipment } =
  buildCrud(Shipment, { modelName: 'Shipment' });
