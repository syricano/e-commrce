import express from 'express';
import { auth } from '../middleware/auth.js';
import { ensureSellerAuto } from '../middleware/roleAuth.js';
import { listInventorys, getInventory, createInventory, updateInventory, deleteInventory } from '../controllers/inventoryController.js';

const inventoryRouter = express.Router();

// Public reads
inventoryRouter.get('/', listInventorys);
inventoryRouter.get('/:id', getInventory);

// Protected writes
inventoryRouter.post('/', auth, ensureSellerAuto, createInventory);
inventoryRouter.put('/:id', auth, ensureSellerAuto, updateInventory);
inventoryRouter.delete('/:id', auth, ensureSellerAuto, deleteInventory);

export default inventoryRouter;
