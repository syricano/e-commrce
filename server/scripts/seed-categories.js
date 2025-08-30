// server/scripts/seed-categories.js
import sequelize from '../db/index.js';
import applyAssociations from '../db/association.js';
import { Op } from 'sequelize';
import Category from '../models/Category.js';
import CategoryTranslation from '../models/CategoryTranslation.js';

const slugify = (s = '') => String(s).trim().toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') || `s-${Date.now()}`;

async function uniqueSlugForLocale(slug, locale){
  let cand = slug || `s-${Date.now()}`;
  for (let i=0;i<50;i++){
    const ex = await CategoryTranslation.findOne({ where: { slug: cand, locale } });
    if (!ex) return cand;
    cand = `${slug}-${i+2}`;
  }
  return `${slug}-${Date.now()}`;
}

// Define a broader taxonomy with optional per-category filters
const TREE = [
  { key:'vehicles', en:'Vehicles', ar:'مركبات', filters: null, children:[
    { key:'cars', en:'Cars', ar:'سيارات', filters:{ fields:[
      { key:'make', label:'Make', type:'select', options:['Toyota','Hyundai','Mercedes','BMW','Audi','Nissan','Kia'] },
      { key:'year', label:'Year', type:'number' },
      { key:'fuel', label:'Fuel', type:'select', options:['Petrol','Diesel','Hybrid','Electric'] },
    ]}},
    { key:'motorcycles', en:'Motorcycles', ar:'دراجات نارية', filters:{ fields:[
      { key:'make', label:'Make', type:'select', options:['Honda','Yamaha','Kawasaki','BMW','Suzuki'] },
      { key:'engine_cc', label:'Engine (cc)', type:'number' },
    ]}},
    { key:'car_parts', en:'Car Parts', ar:'قطع سيارات', filters:null, children:[
      { key:'tyres', en:'Tires', ar:'إطارات', filters:{ fields:[
        { key:'tire_width', label:'Tire Width', type:'number' },
        { key:'tire_profile', label:'Tire Profile', type:'number' },
        { key:'rim_diameter', label:'Rim Diameter', type:'number' },
      ]}},
      { key:'lights', en:'Lights', ar:'أنوار', filters:{ fields:[
        { key:'light_type', label:'Light Type', type:'select', options:['Headlight','Fog','Tail','Signal'] },
        { key:'bulb', label:'Bulb Type', type:'select', options:['Halogen','LED','Xenon'] },
      ]}},
      { key:'oil', en:'Oil', ar:'زيوت', filters:{ fields:[
        { key:'viscosity', label:'Viscosity', type:'select', options:['0W-20','5W-30','5W-40','10W-40'] },
        { key:'oil_type', label:'Oil Type', type:'select', options:['Synthetic','Semi-Synthetic','Mineral'] },
      ]}},
      { key:'batteries', en:'Batteries', ar:'بطاريات', filters:null },
      { key:'brakes', en:'Brakes', ar:'فرامل', filters:null },
    ]},
    { key:'trucks', en:'Trucks', ar:'شاحنات', filters:null },
    { key:'bicycles', en:'Bicycles', ar:'دراجات', filters:null },
    { key:'boats', en:'Boats', ar:'قوارب', filters:null },
  ]},
  { key:'electronics', en:'Electronics', ar:'إلكترونيات', filters:null, children:[
    { key:'phones', en:'Phones', ar:'هواتف', filters:{ fields:[
      { key:'brand', label:'Brand', type:'select', options:['Apple','Samsung','Xiaomi','Huawei','Nokia'] },
      { key:'storage', label:'Storage', type:'select', options:['64GB','128GB','256GB','512GB','1TB'] },
      { key:'ram', label:'RAM (GB)', type:'number' },
      { key:'screen_size', label:'Screen Size (in)', type:'number' },
      { key:'camera_mp', label:'Camera (MP)', type:'number' },
    ]}},
    { key:'computers', en:'Computers', ar:'حواسيب', filters:{ fields:[
      { key:'brand', label:'Brand', type:'select', options:['Apple','HP','Dell','Lenovo','Asus','Acer'] },
      { key:'ram', label:'RAM (GB)', type:'number' },
    ]}},
    { key:'laptops', en:'Laptops', ar:'حاسبات محمولة', filters:{ fields:[
      { key:'brand', label:'Brand', type:'select', options:['Apple','HP','Dell','Lenovo','Asus','Acer'] },
      { key:'cpu', label:'CPU', type:'select', options:['Intel i5','Intel i7','Intel i9','Ryzen 5','Ryzen 7'] },
      { key:'ram', label:'RAM (GB)', type:'number' },
      { key:'storage', label:'Storage', type:'select', options:['256GB','512GB','1TB','2TB'] },
      { key:'screen_size', label:'Screen Size (in)', type:'number' },
    ]}},
    { key:'tablets', en:'Tablets', ar:'أجهزة لوحية', filters:{ fields:[
      { key:'brand', label:'Brand', type:'select', options:['Apple','Samsung','Lenovo','Huawei'] },
      { key:'storage', label:'Storage', type:'select', options:['64GB','128GB','256GB','512GB'] },
      { key:'screen_size', label:'Screen Size (in)', type:'number' },
    ]}},
    { key:'tv_video', en:'TV & Video', ar:'تلفزيون وفيديو', filters:null },
    { key:'audio', en:'Audio & Headphones', ar:'صوتيات وسماعات', filters:null },
    { key:'cameras', en:'Cameras & Photography', ar:'كاميرات وتصوير', filters:null },
    { key:'gaming', en:'Gaming', ar:'ألعاب إلكترونية', filters:null },
    { key:'wearables', en:'Wearables', ar:'أجهزة قابلة للارتداء', filters:null },
    { key:'elec_accessories', en:'Accessories', ar:'إكسسوارات', filters:null },
  ]},
  { key:'fashion', en:'Fashion', ar:'أزياء', filters:null, children:[
    { key:'mens', en:"Men's", ar:'رجالي', filters:{ fields:[ 
      { key:'size', label:'Size', type:'select', options:['S','M','L','XL','XXL'] },
      { key:'color', label:'Color', type:'select', options:['Black','White','Blue','Red','Green'] },
      { key:'material', label:'Material', type:'select', options:['Cotton','Polyester','Wool','Linen','Leather'] },
    ]}},
    { key:'womens', en:"Women's", ar:'نسائي', filters:{ fields:[ 
      { key:'size', label:'Size', type:'select', options:['XS','S','M','L','XL'] },
      { key:'color', label:'Color', type:'select', options:['Black','White','Blue','Red','Pink'] },
      { key:'material', label:'Material', type:'select', options:['Cotton','Polyester','Wool','Linen','Silk'] },
    ]}},
    { key:'kids', en:'Kids', ar:'أطفال', filters:null },
    { key:'shoes', en:'Shoes', ar:'أحذية', filters:null },
    { key:'bags', en:'Bags', ar:'حقائب', filters:null },
    { key:'watches_jewelry', en:'Watches & Jewelry', ar:'ساعات ومجوهرات', filters:null },
  ]},
  { key:'home_kitchen', en:'Home & Kitchen', ar:'المنزل والمطبخ', filters:null, children:[
    { key:'furniture', en:'Furniture', ar:'أثاث', filters:{ fields:[
      { key:'material', label:'Material', type:'select', options:['Wood','Metal','Glass','Plastic'] },
      { key:'color', label:'Color', type:'select', options:['Black','White','Brown','Gray'] },
    ]}},
    { key:'home_decor', en:'Home Decor', ar:'ديكور المنزل', filters:null },
    { key:'kitchen_dining', en:'Kitchen & Dining', ar:'المطبخ وتناول الطعام', filters:null },
    { key:'bedding', en:'Bedding', ar:'مفروشات', filters:null },
    { key:'tools_improvement', en:'Tools & Home Improvement', ar:'أدوات وتحسين المنزل', filters:null },
  ]},
  { key:'appliances', en:'Appliances', ar:'أجهزة منزلية', filters:null, children:[
    { key:'large_appliances', en:'Large Appliances', ar:'أجهزة كبيرة', filters:{ fields:[
      { key:'energy_rating', label:'Energy Rating', type:'select', options:['A++','A+','A','B'] },
      { key:'capacity', label:'Capacity', type:'number' },
    ]}},
    { key:'small_appliances', en:'Small Appliances', ar:'أجهزة صغيرة', filters:{ fields:[
      { key:'power_watts', label:'Power (W)', type:'number' },
      { key:'capacity', label:'Capacity', type:'number' },
    ]}},
  ]},
  { key:'grocery', en:'Grocery', ar:'بقالة', filters:null },
  { key:'health_beauty', en:'Health & Beauty', ar:'الصحة والجمال', filters:null, children:[
    { key:'beauty', en:'Beauty', ar:'تجميل', filters:null },
    { key:'personal_care', en:'Personal Care', ar:'العناية الشخصية', filters:null },
    { key:'pharmacy', en:'Pharmacy', ar:'صيدلية', filters:null },
  ]},
  { key:'sports_outdoors', en:'Sports & Outdoors', ar:'الرياضة والهواء الطلق', filters:null, children:[
    { key:'fitness', en:'Exercise & Fitness', ar:'تمارين ولياقة', filters:null },
    { key:'outdoor', en:'Outdoor Recreation', ar:'نشاطات خارجية', filters:null },
  ]},
  { key:'toys_games', en:'Toys & Games', ar:'ألعاب وهوايات', filters:null },
  { key:'books_media', en:'Books & Media', ar:'كتب ووسائط', filters:null },
  { key:'baby', en:'Baby', ar:'رضّع', filters:null },
  { key:'pet_supplies', en:'Pet Supplies', ar:'مستلزمات الحيوانات', filters:null },
  { key:'office_stationery', en:'Office & Stationery', ar:'مكتبية وقرطاسية', filters:null },
  { key:'industrial_tools', en:'Industrial & Tools', ar:'الصناعي والأدوات', filters:null },
  { key:'hardware', en:'Hardware', ar:'معدات وأدوات', filters:null },
];

async function wipe(){
  if (process.env.SEED_WIPE === 'true'){
    await CategoryTranslation.destroy({ where:{}, force:true });
    await Category.destroy({ where:{}, force:true });
  }
}

async function insertNode(node, parentId=null){
  // Try to find existing category by EN name
  let baseTr = await CategoryTranslation.findOne({ where: { locale:'en', name: node.en } });
  let base;
  if (baseTr){
    base = await Category.findByPk(baseTr.categoryId);
    if (base && (base.parentId || null) !== (parentId || null)) await base.update({ parentId });
    if (base && node.filters){
      const metadata = { ...(base.metadata || {}), filters: node.filters };
      await base.update({ metadata });
    }
  }
  if (!base){
    base = await Category.create({ parentId, position:0, isActive:true, metadata: node.filters ? { filters: node.filters } : {} });
  }
  // Ensure translations
  for (const loc of ['en','ar']){
    const name = node[loc];
    let tr = await CategoryTranslation.findOne({ where: { categoryId: base.id, locale: loc } });
    if (!tr){ const slug = await uniqueSlugForLocale(slugify(name), loc); await CategoryTranslation.create({ categoryId: base.id, locale: loc, name, slug }); }
    else if (tr.name !== name){ await tr.update({ name }); }
  }
  if (Array.isArray(node.children)){
    for (const child of node.children) await insertNode(child, base.id);
  }
  return base.id;
}

async function main(){
  try{
    await sequelize.authenticate();
    applyAssociations();
    console.log('Seeding categories…');
    await wipe();
    for (const root of TREE) await insertNode(root, null);
    console.log('✅ Categories seeded');
    process.exit(0);
  }catch(e){
    console.error('❌ Seed failed:', e);
    process.exit(1);
  }
}

main();
