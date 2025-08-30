// server/scripts/repair-taxonomy.js
import sequelize from '../db/index.js';
import applyAssociations from '../db/association.js';
import { Op } from 'sequelize';
import Category from '../models/Category.js';
import CategoryTranslation from '../models/CategoryTranslation.js';
import Listing from '../models/Listing.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import BrandTranslation from '../models/BrandTranslation.js';
import Collection from '../models/Collection.js';
import CollectionTranslation from '../models/CollectionTranslation.js';

const slugify = (s = '') => String(s).trim().toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') || `s-${Date.now()}`;

async function uniqueSlugForLocale(Model, slug, locale, ignoreId=null){
  let cand = slug || `s-${Date.now()}`;
  for (let i=0;i<50;i++){
    const where = { slug:cand, locale };
    if (ignoreId) where.id = { [Op.ne]: ignoreId };
    const ex = await Model.findOne({ where });
    if (!ex) return cand;
    cand = `${slug}-${i+2}`;
  }
  return `${slug}-${Date.now()}`;
}

const EN_AR = {
  root: { en:'Vehicles', ar:'مركبات', synonymsEn: ['Vehicles','Automotive'], synonymsAr: ['مركبات'] },
  cars: { en:'Cars', ar:'سيارات' },
  motorcycles: { en:'Motorcycles', ar:'دراجات نارية' },
  accessories: { en:'Accessories', ar:'إكسسوارات' },
};

async function ensureArFor(Model, TrModel, fk, nameField, subtitleField){
  const rows = await Model.findAll();
  const trs = await TrModel.findAll();
  const by = new Map();
  for (const t of trs){ const id=Number(t[fk]); if(!by.has(id)) by.set(id,[]); by.get(id).push(t); }
  for (const r of rows){
    const list = by.get(Number(r.id)) || [];
    const en = list.find(x=>x.locale==='en');
    const ar = list.find(x=>x.locale==='ar');
    if (!ar){
      const name = en?.[nameField] || en?.title || list[0]?.[nameField] || list[0]?.title || `item-${r.id}`;
      const slug = await uniqueSlugForLocale(TrModel, slugify(name), 'ar');
      const payload = { [fk]:r.id, locale:'ar', [nameField]:name, slug };
      if (subtitleField) payload[subtitleField] = list[0]?.[subtitleField] || null;
      await TrModel.create(payload);
    }
  }
}

async function findCategoryByNames(enName, arName){
  const listEn = Array.isArray(enName) ? enName : [enName].filter(Boolean);
  const listAr = Array.isArray(arName) ? arName : [arName].filter(Boolean);
  const ors = [];
  for (const n of listEn) ors.push({ name: n });
  for (const n of listAr) ors.push({ name: n });
  if (ors.length === 0) return null;
  const trs = await CategoryTranslation.findAll({ where:{ [Op.or]: ors } });
  const id = trs[0]?.categoryId; if (!id) return null; return await Category.findByPk(id);
}

async function ensureVehiclesWithChildren(){
  // Find or create root (Vehicles/Automotive)
  let root = await findCategoryByNames(EN_AR.root.synonymsEn, EN_AR.root.synonymsAr);
  if (!root) root = await Category.create({ parentId:null, position:0, isActive:true, metadata:{} });
  const rootId = Number(root.id);
  // Ensure translations to canonical names
  for (const loc of ['en','ar']){
    const name = EN_AR.root[loc];
    let tr = await CategoryTranslation.findOne({ where:{ categoryId:rootId, locale:loc } });
    if (!tr){ const slug = await uniqueSlugForLocale(CategoryTranslation, slugify(name), loc); await CategoryTranslation.create({ categoryId:rootId, locale:loc, name, slug }); }
    else if (tr.name !== name){ await tr.update({ name }); }
  }
  for (const key of ['cars','motorcycles','accessories']){
    const en = EN_AR[key].en, ar = EN_AR[key].ar;
    const candTr = await CategoryTranslation.findAll({ where:{ [Op.or]:[{name:en},{name:ar}] } });
    const ids = [...new Set(candTr.map(t=>Number(t.categoryId)))];
    const candidates = await Category.findAll({ where:{ id: ids } });
    let canonical = candidates.find(c=>Number(c.parentId||0)===rootId) || candidates.sort((a,b)=>a.id-b.id)[0];
    if (!canonical) canonical = await Category.create({ parentId:rootId, position:0, isActive:true, metadata:{} });
    if (Number(canonical.parentId||0)!==rootId) await canonical.update({ parentId:rootId });
    for (const loc of ['en','ar']){
      const name = EN_AR[key][loc];
      let tr = await CategoryTranslation.findOne({ where:{ categoryId:canonical.id, locale:loc } });
      if (!tr){ const slug = await uniqueSlugForLocale(CategoryTranslation, slugify(name), loc); await CategoryTranslation.create({ categoryId:canonical.id, locale:loc, name, slug }); }
      else if (tr.name !== name){ await tr.update({ name }); }
    }
    for (const dup of candidates){
      if (Number(dup.id)===Number(canonical.id)) continue;
      await Category.update({ parentId: canonical.id }, { where:{ parentId: dup.id } });
      await Listing.update({ categoryId: canonical.id }, { where:{ categoryId: dup.id } });
      await Product.update({ defaultCategoryId: canonical.id }, { where:{ defaultCategoryId: dup.id } });
      await CategoryTranslation.destroy({ where:{ categoryId: dup.id } });
      await Category.destroy({ where:{ id: dup.id } });
      console.log(`Merged duplicate category ${en}/${ar} id=${dup.id} -> ${canonical.id}`);
    }
  }
}

async function main(){
  try{
    await sequelize.authenticate();
    applyAssociations();
    await ensureVehiclesWithChildren();
    await ensureArFor(Brand, BrandTranslation, 'brandId', 'name');
    await ensureArFor(Collection, CollectionTranslation, 'collectionId', 'title', 'subtitle');
    console.log('✅ Taxonomy repaired and AR translations ensured');
    process.exit(0);
  }catch(e){
    console.error('❌ Repair failed:', e);
    process.exit(1);
  }
}

main();
