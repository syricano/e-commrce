import Store from '../models/Store.js';
import { list, getById, updateById, deleteById } from './crudFactory.js';
import asyncHandler from '../utils/asyncHandler.js';

const slugify = (s = '') =>
  String(s)
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const listStores = list(Store);
export const getStore = getById(Store);

// Ensure ownerUserId defaults to the authenticated user if not provided, and slug is generated from name
export const createStore = asyncHandler(async (req, res) => {
  const body = { ...(req.body || {}) };
  if (!body.ownerUserId && req.user?.id) body.ownerUserId = req.user.id;
  if (!body.ownerUserId) return res.status(400).json({ error: 'ownerUserId is required' });
  if (!body.slug && body.name) body.slug = slugify(body.name);
  const row = await Store.create(body);
  res.status(201).json(row);
});

export const updateStore = updateById(Store);
export const deleteStore = deleteById(Store);

export default { listStores, getStore, createStore, updateStore, deleteStore };
