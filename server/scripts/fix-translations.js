// server/scripts/fix-translations.js
// Ensure Arabic translations exist for categories, brands, and collections.
import sequelize from '../db/index.js';
import applyAssociations from '../db/association.js';
import { Op } from 'sequelize';
import Category from '../models/Category.js';
import CategoryTranslation from '../models/CategoryTranslation.js';
import Brand from '../models/Brand.js';
import BrandTranslation from '../models/BrandTranslation.js';
import Collection from '../models/Collection.js';
import CollectionTranslation from '../models/CollectionTranslation.js';

const slugify = (s = '') => String(s).trim().toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') || `s-${Date.now()}`;

async function uniqueSlugForLocale(Model, slug, locale){
  let cand = slug || `s-${Date.now()}`;
  for (let i=0;i<50;i++){
    const ex = await Model.findOne({ where: { slug:cand, locale } });
    if (!ex) return cand;
    cand = `${slug}-${i+2}`;
  }
  return `${slug}-${Date.now()}`;
}

async function ensureArFor(Model, TrModel, fk, nameField){
  const rows = await Model.findAll();
  const trs = await TrModel.findAll();
  const by = new Map();
  for (const t of trs){ const id=Number(t[fk]); if(!by.has(id)) by.set(id,[]); by.get(id).push(t); }
  for (const r of rows){
    const list = by.get(Number(r.id)) || [];
    const en = list.find(x=>x.locale==='en');
    const ar = list.find(x=>x.locale==='ar');
    if (!ar){
      const name = en?.[nameField] || list[0]?.[nameField] || `item-${r.id}`;
      const slug = await uniqueSlugForLocale(TrModel, slugify(name), 'ar');
      await TrModel.create({ [fk]:r.id, locale:'ar', [nameField]:name, slug });
    }
  }
}

async function main(){
  try{
    await sequelize.authenticate();
    applyAssociations();
    await ensureArFor(Category, CategoryTranslation, 'categoryId', 'name');
    await ensureArFor(Brand, BrandTranslation, 'brandId', 'name');
    await ensureArFor(Collection, CollectionTranslation, 'collectionId', 'title');
    console.log('✅ Arabic translations ensured for categories, brands, collections');
    process.exit(0);
  }catch(e){
    console.error('❌ fix-translations failed:', e);
    process.exit(1);
  }
}

main();

