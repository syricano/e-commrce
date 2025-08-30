import asyncHandler from '../utils/asyncHandler.js';
import Store from '../models/Store.js';
import StoreCategory from '../models/StoreCategory.js';

const slugify = (s = '') => String(s).trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

const ensureOwner = async (req, storeId) => {
  const store = await Store.findByPk(storeId);
  if (!store) return { ok:false, code:404, error:'Store not found' };
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff' && store.ownerUserId !== req.user?.id) {
    return { ok:false, code:403, error:'Forbidden' };
  }
  return { ok:true, store };
};

export const list = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ error: 'storeId required' });
  const rows = await StoreCategory.findAll({ where: { storeId }, order: [['position','ASC'],['id','ASC']] });
  res.json(rows);
});

export const create = asyncHandler(async (req, res) => {
  const { storeId, name, parentId, fields, position, isActive } = req.body || {};
  if (!storeId || !name) return res.status(400).json({ error: 'storeId and name required' });
  const chk = await ensureOwner(req, storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  const payload = { storeId, parentId: parentId || null, name, slug: slugify(name), fields: fields || {}, position: position || 0, isActive: isActive !== false };
  const row = await StoreCategory.create(payload);
  res.status(201).json(row);
});

export const update = asyncHandler(async (req, res) => {
  const row = await StoreCategory.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  const patch = { ...req.body };
  if (patch.name && !patch.slug) patch.slug = slugify(patch.name);
  await row.update(patch);
  res.json(row);
});

export const remove = asyncHandler(async (req, res) => {
  const row = await StoreCategory.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  await row.destroy();
  res.status(204).end();
});

export default { list, create, update, remove };

