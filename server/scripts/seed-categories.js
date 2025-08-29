// server/scripts/seed-categories.js
import sequelize from '../db/index.js';
import applyAssociations from '../db/association.js';
import Category from '../models/Category.js';
import CategoryTranslation from '../models/CategoryTranslation.js';

const slugify = (s) => String(s||'').trim().toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

const DATA = [
  {
    key: 'electronics',
    translations: { en: 'Electronics', ar: 'إلكترونيات' },
    children: [
      { key: 'phones', translations: { en: 'Mobile Phones', ar: 'هواتف' }, metadata: { filters: { fields: [
        { key:'brand', label:'Brand', type:'select', options:['Apple','Samsung','Xiaomi','Huawei','Oppo','Nokia'] },
        { key:'model', label:'Model', type:'text' },
        { key:'storage', label:'Storage', type:'select', options:['32GB','64GB','128GB','256GB','512GB'] },
        { key:'ram', label:'RAM (GB)', type:'number' },
        { key:'batteryMah', label:'Battery (mAh)', type:'number' },
        { key:'network', label:'Network', type:'select', options:['4G','5G'] },
      ]}}},
      { key: 'computers', translations: { en: 'Computers & Laptops', ar: 'حواسيب' }, metadata: { filters: { fields: [
        { key:'brand', label:'Brand', type:'select', options:['Apple','Dell','HP','Lenovo','Asus','Acer'] },
        { key:'cpu', label:'CPU', type:'text' },
        { key:'gpu', label:'GPU', type:'text' },
        { key:'ram', label:'RAM (GB)', type:'number' },
        { key:'storage', label:'Storage (GB)', type:'number' },
        { key:'storageType', label:'Storage Type', type:'select', options:['HDD','SSD','NVMe'] },
      ]}}},
      { key: 'cameras', translations: { en: 'Cameras', ar: 'كاميرات' }, metadata: { filters: { fields: [
        { key:'type', label:'Type', type:'select', options:['DSLR','Mirrorless','Action','Compact'] },
        { key:'sensor', label:'Sensor', type:'select', options:['Full-frame','APS-C','Micro Four Thirds'] },
        { key:'megapixels', label:'Megapixels', type:'number' },
        { key:'brand', label:'Brand', type:'text' },
      ]}}},
      { key: 'audio', translations: { en: 'Audio', ar: 'صوتيات' }, metadata: { filters: { fields: [
        { key:'type', label:'Type', type:'select', options:['Headphones','Earbuds','Speakers','Soundbar'] },
        { key:'connectivity', label:'Connectivity', type:'select', options:['Bluetooth','Wired'] },
        { key:'noiseCancelling', label:'Noise Cancelling', type:'select', options:['Yes','No'] },
        { key:'brand', label:'Brand', type:'text' },
      ]}}},
    ],
  },
  {
    key: 'automotive',
    translations: { en: 'Automotive', ar: 'سيارات' },
    children: [
      { key: 'cars', translations: { en: 'Cars', ar: 'سيارات' }, metadata: { filters: { fields: [
        { key:'make', label:'Make', type:'select', options:['Toyota','Honda','Hyundai','Kia','Ford','Chevrolet','Nissan','BMW','Mercedes','Audi','Volkswagen','Mazda'] },
        { key:'model', label:'Model', type:'text' },
        { key:'year', label:'Year', type:'number' },
        { key:'mileage', label:'Mileage (km)', type:'number' },
        { key:'fuel', label:'Fuel', type:'select', options:['Petrol','Diesel','Hybrid','Electric'] },
        { key:'transmission', label:'Transmission', type:'select', options:['Automatic','Manual'] },
        { key:'body', label:'Body Type', type:'select', options:['Sedan','SUV','Hatchback','Coupe','Wagon','Van','Pickup'] },
        { key:'color', label:'Color', type:'text' },
      ]}}},
      { key: 'motorcycles', translations: { en: 'Motorcycles', ar: 'دراجات نارية' }, metadata: { filters: { fields: [
        { key:'make', label:'Make', type:'text' },
        { key:'model', label:'Model', type:'text' },
        { key:'year', label:'Year', type:'number' },
        { key:'engineCc', label:'Engine (cc)', type:'number' },
        { key:'type', label:'Type', type:'select', options:['Sport','Cruiser','Touring','Off-road','Scooter'] },
      ]}}},
      { key: 'parts', translations: { en: 'Parts & Accessories', ar: 'قطع وإكسسوارات' }, metadata: { filters: { fields: [
        { key:'partType', label:'Part Type', type:'text' },
        { key:'oemNumber', label:'OEM / MPN', type:'text' },
        { key:'compatibility', label:'Compatibility', type:'text' },
        { key:'brand', label:'Brand', type:'text' },
      ]}}},
    ],
  },
  {
    key: 'fashion', translations: { en: 'Fashion', ar: 'أزياء' }, children:[
      { key: 'men-clothing', translations: { en:'Men Clothing', ar:'ملابس رجالية' }, metadata:{ filters:{ fields:[
        { key:'size', label:'Size', type:'select', options:['XS','S','M','L','XL','XXL'] },
        { key:'color', label:'Color', type:'text' },
        { key:'material', label:'Material', type:'text' },
        { key:'brand', label:'Brand', type:'text' },
        { key:'fit', label:'Fit', type:'select', options:['Slim','Regular','Relaxed'] },
      ]}}},
      { key: 'women-clothing', translations: { en:'Women Clothing', ar:'ملابس نسائية' }, metadata:{ filters:{ fields:[
        { key:'size', label:'Size', type:'select', options:['XS','S','M','L','XL','XXL'] },
        { key:'color', label:'Color', type:'text' },
        { key:'material', label:'Material', type:'text' },
        { key:'brand', label:'Brand', type:'text' },
        { key:'fit', label:'Fit', type:'select', options:['Slim','Regular','Relaxed'] },
      ]}}},
      { key: 'shoes', translations: { en:'Shoes', ar:'أحذية' }, metadata:{ filters:{ fields:[
        { key:'size', label:'Size', type:'text' },
        { key:'color', label:'Color', type:'text' },
        { key:'material', label:'Material', type:'text' },
        { key:'brand', label:'Brand', type:'text' },
        { key:'type', label:'Type', type:'select', options:['Sneakers','Boots','Heels','Sandals','Formal'] },
      ]}}},
      { key: 'bags', translations: { en:'Bags & Accessories', ar:'حقائب وإكسسوارات' }, metadata:{ filters:{ fields:[
        { key:'bagType', label:'Type', type:'select', options:['Backpack','Handbag','Shoulder Bag','Wallet','Luggage'] },
        { key:'material', label:'Material', type:'text' },
        { key:'color', label:'Color', type:'text' },
        { key:'brand', label:'Brand', type:'text' },
      ]}}},
    ]
  },
  {
    key: 'home-garden', translations:{ en:'Home & Garden', ar:'المنزل والحديقة' }, metadata:{ filters:{ fields:[
      { key:'room', label:'Room', type:'select', options:['Kitchen','Living Room','Bedroom','Bathroom','Outdoor'] },
      { key:'material', label:'Material', type:'text' },
      { key:'color', label:'Color', type:'text' },
      { key:'dimensions', label:'Dimensions', type:'text' },
      { key:'brand', label:'Brand', type:'text' },
    ]}} },
  {
    key: 'sports', translations:{ en:'Sports', ar:'رياضة' }, metadata:{ filters:{ fields:[
      { key:'sport', label:'Sport', type:'select', options:['Football','Basketball','Tennis','Running','Cycling','Fitness'] },
      { key:'size', label:'Size', type:'text' },
      { key:'brand', label:'Brand', type:'text' },
    ]}} },
  {
    key: 'toys', translations:{ en:'Toys', ar:'ألعاب' }, metadata:{ filters:{ fields:[
      { key:'ageRange', label:'Age Range', type:'select', options:['0-2','3-5','6-8','9-12','13+'] },
      { key:'brand', label:'Brand', type:'text' },
      { key:'category', label:'Type', type:'text' },
      { key:'batteries', label:'Batteries Required', type:'select', options:['Yes','No'] },
      { key:'safety', label:'Safety Cert.', type:'text' },
    ]}} },
  {
    key: 'health-beauty', translations:{ en:'Health & Beauty', ar:'الصحة والجمال' }, metadata:{ filters:{ fields:[
      { key:'brand', label:'Brand', type:'text' },
      { key:'skinType', label:'Skin Type', type:'select', options:['Normal','Dry','Oily','Combination','Sensitive'] },
      { key:'productType', label:'Type', type:'text' },
      { key:'scent', label:'Scent', type:'text' },
      { key:'volumeMl', label:'Volume (ml)', type:'number' },
    ]}} },
  {
    key: 'books-media', translations:{ en:'Books & Media', ar:'كتب ووسائط' }, metadata:{ filters:{ fields:[
      { key:'author', label:'Author', type:'text' },
      { key:'language', label:'Language', type:'select', options:['English','Arabic','German','French','Spanish'] },
      { key:'format', label:'Format', type:'select', options:['Hardcover','Paperback','eBook','Audio Book'] },
      { key:'publisher', label:'Publisher', type:'text' },
      { key:'isbn', label:'ISBN', type:'text' },
    ]}} },
  {
    key: 'grocery', translations:{ en:'Grocery', ar:'بقالة' }, metadata:{ filters:{ fields:[
      { key:'brand', label:'Brand', type:'text' },
      { key:'weightGrams', label:'Weight (g)', type:'number' },
      { key:'packageSize', label:'Package Size', type:'select', options:['Single','2-Pack','4-Pack','Family'] },
      { key:'organic', label:'Organic', type:'select', options:['Yes','No'] },
      { key:'expiry', label:'Expiry (YYYY-MM)', type:'text' },
      { key:'halal', label:'Halal', type:'select', options:['Yes','No'] },
    ]}} },
  {
    key: 'baby', translations:{ en:'Baby', ar:'مواليد' }, metadata:{ filters:{ fields:[
      { key:'ageRange', label:'Age Range', type:'select', options:['0-3m','3-6m','6-12m','12-24m','2-4y'] },
      { key:'size', label:'Size', type:'text' },
      { key:'brand', label:'Brand', type:'text' },
      { key:'diaperSize', label:'Diaper Size', type:'select', options:['NB','1','2','3','4','5','6'] },
    ]}} },
  {
    key: 'pet-supplies', translations:{ en:'Pet Supplies', ar:'مستلزمات الحيوانات' }, metadata:{ filters:{ fields:[
      { key:'animal', label:'Animal', type:'select', options:['Dog','Cat','Bird','Fish','Small Animal'] },
      { key:'size', label:'Size', type:'text' },
      { key:'brand', label:'Brand', type:'text' },
      { key:'flavor', label:'Flavor', type:'text' },
    ]}} },
  {
    key: 'office', translations:{ en:'Office', ar:'مكتب' }, metadata:{ filters:{ fields:[
      { key:'category', label:'Category', type:'select', options:['Stationery','Furniture','Electronics','Supplies'] },
      { key:'brand', label:'Brand', type:'text' },
      { key:'color', label:'Color', type:'text' },
    ]}} },
];

async function upsertCategoryTree(nodes, parentId = null) {
  for (const node of nodes) {
    const base = { parentId, position: 0, isActive: true, metadata: node.metadata || {} };
    const created = await Category.create(base);

    const en = { categoryId: created.id, locale: 'en', name: node.translations.en, slug: node.slug || slugify(node.translations.en) };
    const ar = { categoryId: created.id, locale: 'ar', name: node.translations.ar || node.translations.en, slug: node.slug || slugify(node.translations.en) };
    await CategoryTranslation.create(en).catch(async()=>{
      // retry by appending id for uniqueness
      await CategoryTranslation.create({ ...en, slug: `${en.slug}-${created.id}` });
    });
    await CategoryTranslation.create(ar).catch(async()=>{
      await CategoryTranslation.create({ ...ar, slug: `${ar.slug}-${created.id}` });
    });

    if (Array.isArray(node.children) && node.children.length) {
      await upsertCategoryTree(node.children, created.id);
    }
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    applyAssociations();
    await sequelize.sync({ alter: true });

    // simple wipe of existing categories/translations (optional: keep data)
    await CategoryTranslation.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });

    await upsertCategoryTree(DATA);
    console.log('✅ Seeded categories');
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed failed', e);
    process.exit(1);
  }
}

main();
