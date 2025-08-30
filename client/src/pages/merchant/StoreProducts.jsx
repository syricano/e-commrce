import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { errorHandler } from '@/utils';

export default function StoreProducts() {
  const { id } = useParams();
  usePageTitle('Store Products');
  const storeId = id;
  const { lang, t } = useLang();
  const [categories, setCategories] = useState([]);
  const [catTrs, setCatTrs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ categoryId: '', articleNumber: '', name: '', description: '' });
  const [attr, setAttr] = useState({});
  const [uploadingId, setUploadingId] = useState(null);

  // Fallback dynamic attributes per category when server metadata is missing
  const slugify = (s) => String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-_]/g,'').replace(/[\s_]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  const slugOf = (id) => {
    const pref = (catTrs || []).find(t => Number(t.categoryId) === Number(id) && t.locale === 'en')
              || (catTrs || []).find(t => Number(t.categoryId) === Number(id));
    return pref?.slug || (pref?.name ? slugify(pref.name) : '');
  };
  const DEFAULT_FIELDS = {
    // ===== Vehicles general =====
    cars: [
      { key:'make', label:'Make', type:'select', options:['Toyota','Hyundai','Nissan','BMW','Mercedes','Audi','Kia','Honda'] },
      { key:'model', label:'Model', type:'text' },
      { key:'year', label:'Year', type:'number' },
      { key:'mileage_km', label:'Mileage (km)', type:'number' },
      { key:'fuel', label:'Fuel', type:'select', options:['Petrol','Diesel','Hybrid','Electric','LPG'] },
      { key:'transmission', label:'Transmission', type:'select', options:['Automatic','Manual','CVT'] },
      { key:'body_type', label:'Body Type', type:'select', options:['Sedan','Hatchback','SUV','Coupe','Pickup','Van'] },
      { key:'engine', label:'Engine', type:'text' },
      { key:'color', label:'Color', type:'select', options:['Black','White','Gray','Silver','Blue','Red','Green'] },
    ],
    motorcycles: [
      { key:'make', label:'Make', type:'select', options:['Honda','Yamaha','Kawasaki','BMW','Ducati','Suzuki'] },
      { key:'model', label:'Model', type:'text' },
      { key:'year', label:'Year', type:'number' },
      { key:'engine_cc', label:'Engine (cc)', type:'number' },
      { key:'mileage_km', label:'Mileage (km)', type:'number' },
      { key:'color', label:'Color', type:'select', options:['Black','White','Gray','Blue','Red','Green'] },
    ],
    trucks: [
      { key:'make', label:'Make', type:'text' },
      { key:'model', label:'Model', type:'text' },
      { key:'year', label:'Year', type:'number' },
      { key:'payload_kg', label:'Payload (kg)', type:'number' },
      { key:'fuel', label:'Fuel', type:'select', options:['Diesel','Petrol','Hybrid','Electric'] },
    ],
    bicycles: [
      { key:'type', label:'Type', type:'select', options:['Road','Mountain','Hybrid','Electric','BMX'] },
      { key:'frame_size', label:'Frame Size', type:'text' },
      { key:'wheel_size', label:'Wheel Size', type:'text' },
      { key:'color', label:'Color', type:'select', options:['Black','White','Blue','Red','Green'] },
    ],
    boats: [
      { key:'type', label:'Type', type:'select', options:['Fishing','Speedboat','Sailboat','Jet Ski'] },
      { key:'length_m', label:'Length (m)', type:'number' },
      { key:'engine', label:'Engine', type:'text' },
    ],
    mens: [
      { key:'size', label:'Size', type:'select', options:['S','M','L','XL','XXL'] },
      { key:'color', label:'Color', type:'select', options:['Black','White','Blue','Red','Green'] },
      { key:'material', label:'Material', type:'select', options:['Cotton','Polyester','Wool','Linen','Leather'] },
    ],
    womens: [
      { key:'size', label:'Size', type:'select', options:['XS','S','M','L','XL'] },
      { key:'color', label:'Color', type:'select', options:['Black','White','Blue','Red','Pink'] },
      { key:'material', label:'Material', type:'select', options:['Cotton','Polyester','Wool','Linen','Silk'] },
    ],
    tyres: [
      { key:'tire_width', label:'Tire Width', type:'number' },
      { key:'tire_profile', label:'Tire Profile', type:'number' },
      { key:'rim_diameter', label:'Rim Diameter', type:'number' },
    ],
    lights: [
      { key:'light_type', label:'Light Type', type:'select', options:['Headlight','Fog','Tail','Signal'] },
      { key:'bulb', label:'Bulb Type', type:'select', options:['Halogen','LED','Xenon'] },
    ],
    oil: [
      { key:'viscosity', label:'Viscosity', type:'select', options:['0W-20','5W-30','5W-40','10W-40'] },
      { key:'oil_type', label:'Oil Type', type:'select', options:['Synthetic','Semi-Synthetic','Mineral'] },
    ],
    phones: [
      { key:'brand', label:'Brand', type:'select', options:['Apple','Samsung','Xiaomi','Huawei','Nokia'] },
      { key:'storage', label:'Storage', type:'select', options:['64GB','128GB','256GB','512GB','1TB'] },
      { key:'ram', label:'RAM (GB)', type:'number' },
      { key:'screen_size', label:'Screen Size (in)', type:'number' },
      { key:'camera_mp', label:'Camera (MP)', type:'number' },
    ],
    laptops: [
      { key:'brand', label:'Brand', type:'select', options:['Apple','HP','Dell','Lenovo','Asus','Acer'] },
      { key:'cpu', label:'CPU', type:'select', options:['Intel i5','Intel i7','Intel i9','Ryzen 5','Ryzen 7'] },
      { key:'ram', label:'RAM (GB)', type:'number' },
      { key:'storage', label:'Storage', type:'select', options:['256GB','512GB','1TB','2TB'] },
      { key:'screen_size', label:'Screen Size (in)', type:'number' },
    ],
    computers: [
      { key:'brand', label:'Brand', type:'select', options:['HP','Dell','Lenovo','Asus','Acer','Apple'] },
      { key:'cpu', label:'CPU', type:'select', options:['Intel i5','Intel i7','Intel i9','Ryzen 5','Ryzen 7'] },
      { key:'ram', label:'RAM (GB)', type:'number' },
      { key:'storage', label:'Storage', type:'select', options:['256GB','512GB','1TB','2TB'] },
    ],
    tablets: [
      { key:'brand', label:'Brand', type:'select', options:['Apple','Samsung','Lenovo','Huawei'] },
      { key:'storage', label:'Storage', type:'select', options:['64GB','128GB','256GB','512GB'] },
      { key:'screen_size', label:'Screen Size (in)', type:'number' },
    ],
    'tv-video': [
      { key:'brand', label:'Brand', type:'select', options:['Samsung','LG','Sony','TCL','Hisense','Philips'] },
      { key:'screen_size', label:'Screen Size (in)', type:'number' },
      { key:'panel', label:'Panel Type', type:'select', options:['LED','QLED','OLED'] },
      { key:'resolution', label:'Resolution', type:'select', options:['HD','Full HD','4K','8K'] },
    ],
    'audio-headphones': [
      { key:'type', label:'Type', type:'select', options:['Headphones','Earbuds','Speaker','Soundbar'] },
      { key:'connection', label:'Connection', type:'select', options:['Wired','Bluetooth','Wi‑Fi'] },
      { key:'power_watts', label:'Power (W)', type:'number' },
    ],
    'cameras-photography': [
      { key:'type', label:'Type', type:'select', options:['DSLR','Mirrorless','Compact','Action'] },
      { key:'sensor', label:'Sensor', type:'select', options:['Full Frame','APS-C','Micro Four Thirds'] },
      { key:'resolution_mp', label:'Resolution (MP)', type:'number' },
    ],
    gaming: [
      { key:'platform', label:'Platform', type:'select', options:['PlayStation','Xbox','Nintendo','PC'] },
      { key:'storage', label:'Storage', type:'select', options:['512GB','1TB','2TB'] },
    ],
    wearables: [
      { key:'type', label:'Type', type:'select', options:['Smartwatch','Fitness Tracker'] },
      { key:'size', label:'Size', type:'select', options:['Small','Medium','Large'] },
    ],
    furniture: [
      { key:'material', label:'Material', type:'select', options:['Wood','Metal','Glass','Plastic'] },
      { key:'color', label:'Color', type:'select', options:['Black','White','Brown','Gray'] },
    ],
    'large-appliances': [
      { key:'energy_rating', label:'Energy Rating', type:'select', options:['A++','A+','A','B'] },
      { key:'capacity', label:'Capacity', type:'number' },
    ],
    'small-appliances': [
      { key:'power_watts', label:'Power (W)', type:'number' },
      { key:'capacity', label:'Capacity', type:'number' },
    ],
    // ===== Grocery =====
    grocery: [
      { key:'brand', label:'Brand', type:'text' },
      { key:'weight_grams', label:'Weight (g)', type:'number' },
      { key:'dietary', label:'Dietary', type:'select', options:['Halal','Vegan','Vegetarian','Gluten‑free','Organic'] },
    ],
    // ===== Health & Beauty =====
    beauty: [
      { key:'skin_type', label:'Skin Type', type:'select', options:['All','Dry','Oily','Combination','Sensitive'] },
      { key:'shade', label:'Shade', type:'text' },
      { key:'volume_ml', label:'Volume (ml)', type:'number' },
    ],
    'personal-care': [
      { key:'scent', label:'Scent', type:'text' },
      { key:'volume_ml', label:'Volume (ml)', type:'number' },
    ],
    pharmacy: [
      { key:'form', label:'Form', type:'select', options:['Tablet','Capsule','Syrup','Cream'] },
      { key:'dose', label:'Dose', type:'text' },
      { key:'quantity', label:'Quantity', type:'number' },
    ],
    // ===== Sports & Outdoors =====
    'exercise-fitness': [
      { key:'type', label:'Type', type:'select', options:['Weights','Yoga','Cardio','Accessories'] },
      { key:'material', label:'Material', type:'select', options:['Steel','Rubber','Foam','Plastic','Wood'] },
      { key:'weight_kg', label:'Weight (kg)', type:'number' },
    ],
    'outdoor-recreation': [
      { key:'type', label:'Type', type:'select', options:['Camping','Hiking','Cycling','Fishing'] },
      { key:'capacity', label:'Capacity', type:'number' },
      { key:'weight_kg', label:'Weight (kg)', type:'number' },
    ],
    // ===== Toys & Games =====
    'toys-games': [
      { key:'age_group', label:'Age Group', type:'select', options:['0‑2','3‑5','6‑8','9‑12','13+'] },
      { key:'material', label:'Material', type:'select', options:['Plastic','Wood','Metal','Fabric'] },
      { key:'pieces', label:'Pieces', type:'number' },
    ],
    // ===== Books & Media =====
    'books-media': [
      { key:'author', label:'Author', type:'text' },
      { key:'language', label:'Language', type:'select', options:['Arabic','English','French','German'] },
      { key:'format', label:'Format', type:'select', options:['Paperback','Hardcover','eBook','Audio'] },
    ],
    // ===== Baby =====
    baby: [
      { key:'age_group', label:'Age Group', type:'select', options:['0‑3m','3‑6m','6‑12m','12‑24m','2‑4y'] },
      { key:'material', label:'Material', type:'select', options:['Cotton','Polyester','Bamboo'] },
    ],
    // ===== Pet Supplies =====
    'pet-supplies': [
      { key:'species', label:'Species', type:'select', options:['Dog','Cat','Bird','Fish','Small Pet'] },
      { key:'size', label:'Size', type:'select', options:['XS','S','M','L','XL'] },
    ],
    // ===== Office & Stationery =====
    'office-stationery': [
      { key:'type', label:'Type', type:'select', options:['Notebook','Pen','Paper','Folder','Stapler'] },
      { key:'pages', label:'Pages', type:'number' },
      { key:'size', label:'Size', type:'select', options:['A4','A5','A6','Letter'] },
    ],
    // ===== Industrial & Tools =====
    'industrial-tools': [
      { key:'type', label:'Type', type:'select', options:['Drill','Saw','Grinder','Welder'] },
      { key:'power_watts', label:'Power (W)', type:'number' },
      { key:'voltage', label:'Voltage', type:'number' },
      { key:'material', label:'Material', type:'select', options:['Steel','Aluminum','Plastic'] },
    ],
    // ===== Hardware =====
    hardware: [
      { key:'type', label:'Type', type:'select', options:['Screw','Nail','Hinge','Handle'] },
      { key:'size', label:'Size', type:'text' },
      { key:'material', label:'Material', type:'select', options:['Steel','Brass','Aluminum','Plastic'] },
    ],
  };

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, tRes, pRes] = await Promise.all([
        axiosInstance.get('/categories', { params: { limit: 1000 } }),
        axiosInstance.get('/category-translations', { params: { limit: 5000 } }).catch(()=>({ data: [] })),
        axiosInstance.get('/store-products', { params: { storeId } }),
      ]);
      setCategories(cRes?.data?.items || cRes?.data || []);
      setCatTrs(tRes?.data?.items || tRes?.data || []);
      setItems(pRes?.data || []);
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (storeId) load(); }, [storeId]);

  const onCreate = async () => {
    const payload = { storeId: Number(storeId), categoryId: f.categoryId ? Number(f.categoryId) : null, articleNumber: f.articleNumber.trim(), name: f.name.trim(), description: f.description.trim(), attributes: attr };
    // Enforce subcategory when a parent category is selected
    const selected = categories.find(c => String(c.id) === String(payload.categoryId));
    if (selected) {
      const hasChildren = categories.some(c => String(c.parentId || '') === String(selected.id));
      if (hasChildren) return errorHandler(null, t('Please select a subcategory'));
    }
    if (!payload.articleNumber || !payload.name) return;
    try {
      await axiosInstance.post('/store-products', payload);
      setF({ categoryId: '', articleNumber: '', name: '', description: '' });
      setAttr({});
      await load();
    } catch (e) { errorHandler(e, t('Create failed') || 'Create failed'); }
  };

  const onUpload = async (productId, file) => {
    try {
      setUploadingId(productId);
      const base64 = await toBase64(file);
      const filename = `${Date.now()}_${file.name}`;
      const upRes = await axiosInstance.post('/merchant/upload', { filename, data: base64 });
      const url = upRes?.data?.url;
      if (url) await axiosInstance.post(`/store-products/${productId}/media`, { url });
      await load();
    } catch (e) { errorHandler(e, t('Upload failed') || 'Upload failed'); }
    finally { setUploadingId(null); }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return (
    <section className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">{t('Store')} {storeId} — {t('Products')}</h1>
      <StoreNav />

      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">{t('SKU') || 'Article Number (SKU)'}</span>
            <input className="input input-bordered" value={f.articleNumber} onChange={(e)=>setF(s=>({...s, articleNumber:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Name') || 'Name'}</span>
            <input className="input input-bordered" value={f.name} onChange={(e)=>setF(s=>({...s, name:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Category') || 'Category'}</span>
            <select className="select select-bordered" value={f.categoryId} onChange={(e)=>{ setF(s=>({...s, categoryId:e.target.value})); setAttr({}); }}>
              <option value="">{t('None') || '— none —'}</option>
              {categories.map(c => {
                const pref = (catTrs || []).find(t => Number(t.categoryId) === Number(c.id) && t.locale === lang);
                const fallback = (catTrs || []).find(t => Number(t.categoryId) === Number(c.id) && t.locale === 'en') ||
                                 (catTrs || []).find(t => Number(t.categoryId) === Number(c.id));
                const tr = pref || fallback;
                return <option key={c.id} value={c.id}>{tr?.name || tr?.slug || `#${c.id}`}</option>;
              })}
            </select>
          </label>
          {(() => {
            const selected = categories.find(c => String(c.id) === String(f.categoryId));
            const children = selected ? categories.filter(c => String(c.parentId || '') === String(selected.id)) : [];
            if (children.length === 0) return null;
            return (
              <label className="form-control">
                <span className="label-text">{t('Subcategory') || 'Subcategory'}</span>
                <select className="select select-bordered" value={''} onChange={(e)=>{ const v = e.target.value; if (v) setF(s=>({...s, categoryId:v})); }}>
                  <option value="">{t('Select') || 'Select'}</option>
                  {children.map(ch => {
                    const tr = (catTrs || []).find(t => Number(t.categoryId) === Number(ch.id) && (t.locale === lang || t.locale === 'en')) ||
                                (catTrs || []).find(t => Number(t.categoryId) === Number(ch.id));
                    return <option key={ch.id} value={ch.id}>{tr?.name || tr?.slug || `#${ch.id}`}</option>;
                  })}
                </select>
              </label>
            );
          })()}
          <label className="form-control md:col-span-2">
            <span className="label-text">{t('Description') || 'Description'}</span>
            <textarea className="textarea textarea-bordered" rows={3} value={f.description} onChange={(e)=>setF(s=>({...s, description:e.target.value}))} />
          </label>
          {/* Dynamic attributes based on selected category fields */}
          {(() => {
            const cat = categories.find(c => String(c.id) === String(f.categoryId));
            let fields = cat?.metadata?.filters?.fields || [];
            if (!Array.isArray(fields) || fields.length === 0) {
              const slug = slugOf(cat?.id);
              const key = String(slug||'').replace(/_/g,'-');
              fields = DEFAULT_FIELDS[key] || [];
            }
            return Array.isArray(fields) && fields.length > 0 ? (
              <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
                {fields.map(field => (
                  <label key={field.key} className="form-control">
                    <span className="label-text">{t(field.label) || field.label || field.key}</span>
                    {field.type === 'select' ? (
                      <select className="select select-bordered" value={attr[field.key] || ''} onChange={(e)=>setAttr(s=>({...s, [field.key]: e.target.value}))}>
                        <option value="">—</option>
                        {(field.options || []).map(opt => <option key={opt} value={opt}>{t(opt) || opt}</option>)}
                      </select>
                    ) : (
                      <input className="input input-bordered" type={field.type==='number'?'number':'text'} value={attr[field.key] || ''} onChange={(e)=>setAttr(s=>({...s, [field.key]: e.target.value}))} />
                    )}
                  </label>
                ))}
              </div>
            ) : null;
          })()}
          <div className="md:col-span-2 text-right">
            <button className="btn btn-primary" onClick={onCreate}>{t('Add Product') || 'Add Product'}</button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border">
        <div className="card-body">
          {loading && <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>}
          {!loading && items.length === 0 && <div className="opacity-60">{t('No products') || 'No products'}</div>}
          {!loading && items.length > 0 && (
            <ul className="divide-y">
              {items.map(p => (
                <li key={p.id} className="py-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs opacity-70">SKU: {p.articleNumber}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="btn btn-sm">
                        {uploadingId===p.id ? (t('Uploading…') || 'Uploading…') : (t('Add Image') || 'Add Image')}
                        <input type="file" hidden accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) onUpload(p.id, f); }} />
                      </label>
                    </div>
                  </div>
                  {Array.isArray(p.media) && p.media.length>0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {p.media.map(m => {
                        const img = m.url || '';
                        const src = img && !/^https?:\/\//.test(img)
                          ? `${import.meta.env.VITE_FILES_BASE_URL || ''}${img.startsWith('/')? '' : '/'}${img}`
                          : img;
                        return (
                          <div key={m.id} className="relative">
                            <img src={src} alt="" className="w-16 h-16 object-cover rounded" />
                            <button type="button" className="btn btn-ghost btn-xs absolute -top-2 -right-2" onClick={async()=>{ try{ await axiosInstance.delete(`/store-products/${p.id}/media/${m.id}`); await load(); } catch(e){ errorHandler(e, t('Delete failed') || 'Delete failed'); } }}>✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-2 text-right">
                    <button className="btn btn-ghost btn-xs" onClick={async()=>{ if(confirm(t('Delete product?') || 'Delete product?')) { try{ await axiosInstance.delete(`/store-products/${p.id}`); await load(); } catch(e){ errorHandler(e, t('Delete failed') || 'Delete failed'); } } }}>{t('Delete') || 'Delete'}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
