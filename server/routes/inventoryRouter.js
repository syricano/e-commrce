import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listInventorys, getInventory, createInventory, updateInventory, deleteInventory } from '../controllers/inventoryController.js';

const inventoryRouter = express.Router();

// Public reads
inventoryRouter.get('/', listInventorys);
inventoryRouter.get('/:id', getInventory);

// Protected writes
inventoryRouter.post('/', auth, requireAdmin, createInventory);
inventoryRouter.put('/:id', auth, requireAdmin, updateInventory);
inventoryRouter.delete('/:id', auth, requireAdmin, deleteInventory);

export default inventoryRouter;
