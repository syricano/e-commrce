// Default dynamic fields when server metadata is missing

export const DEFAULT_FIELDS = {
  // ===== Vehicles general =====
  cars: [
    { key: 'make', label: 'Make', type: 'select', options: ['Toyota','Hyundai','Nissan','BMW','Mercedes','Audi','Kia','Honda'] },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'mileage_km', label: 'Mileage (km)', type: 'number' },
    { key: 'fuel', label: 'Fuel', type: 'select', options: ['Petrol','Diesel','Hybrid','Electric','LPG'] },
    { key: 'transmission', label: 'Transmission', type: 'select', options: ['Automatic','Manual','CVT'] },
    { key: 'body_type', label: 'Body Type', type: 'select', options: ['Sedan','Hatchback','SUV','Coupe','Pickup','Van'] },
    { key: 'engine', label: 'Engine', type: 'text' },
    { key: 'color', label: 'Color', type: 'select', options: ['Black','White','Gray','Silver','Blue','Red','Green'] },
  ],
  motorcycles: [
    { key: 'make', label: 'Make', type: 'select', options: ['Honda','Yamaha','Kawasaki','BMW','Ducati','Suzuki'] },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'engine_cc', label: 'Engine (cc)', type: 'number' },
    { key: 'mileage_km', label: 'Mileage (km)', type: 'number' },
    { key: 'color', label: 'Color', type: 'select', options: ['Black','White','Gray','Blue','Red','Green'] },
  ],
  trucks: [
    { key: 'make', label: 'Make', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'payload_kg', label: 'Payload (kg)', type: 'number' },
    { key: 'fuel', label: 'Fuel', type: 'select', options: ['Diesel','Petrol','Hybrid','Electric'] },
  ],
  bicycles: [
    { key: 'type', label: 'Type', type: 'select', options: ['Road','Mountain','Hybrid','Electric','BMX'] },
    { key: 'frame_size', label: 'Frame Size', type: 'text' },
    { key: 'wheel_size', label: 'Wheel Size', type: 'text' },
    { key: 'color', label: 'Color', type: 'select', options: ['Black','White','Blue','Red','Green'] },
  ],
  boats: [
    { key: 'type', label: 'Type', type: 'select', options: ['Fishing','Speedboat','Sailboat','Jet Ski'] },
    { key: 'length_m', label: 'Length (m)', type: 'number' },
    { key: 'engine', label: 'Engine', type: 'text' },
  ],
  mens: [
    { key: 'size', label: 'Size', type: 'select', options: ['S','M','L','XL','XXL'] },
    { key: 'color', label: 'Color', type: 'select', options: ['Black','White','Blue','Red','Green'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Cotton','Polyester','Wool','Linen','Leather'] },
  ],
  womens: [
    { key: 'size', label: 'Size', type: 'select', options: ['XS','S','M','L','XL'] },
    { key: 'color', label: 'Color', type: 'select', options: ['Black','White','Blue','Red','Pink'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Cotton','Polyester','Wool','Linen','Silk'] },
  ],
  tyres: [
    { key: 'tire_width', label: 'Tire Width', type: 'number' },
    { key: 'tire_profile', label: 'Tire Profile', type: 'number' },
    { key: 'rim_diameter', label: 'Rim Diameter', type: 'number' },
  ],
  lights: [
    { key: 'light_type', label: 'Light Type', type: 'select', options: ['Headlight','Fog','Tail','Signal'] },
    { key: 'bulb', label: 'Bulb Type', type: 'select', options: ['Halogen','LED','Xenon'] },
  ],
  oil: [
    { key: 'viscosity', label: 'Viscosity', type: 'select', options: ['0W-20','5W-30','5W-40','10W-40'] },
    { key: 'oil_type', label: 'Oil Type', type: 'select', options: ['Synthetic','Semi-Synthetic','Mineral'] },
  ],
  phones: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Apple','Samsung','Xiaomi','Huawei','Nokia'] },
    { key: 'storage', label: 'Storage', type: 'select', options: ['64GB','128GB','256GB','512GB','1TB'] },
    { key: 'ram', label: 'RAM (GB)', type: 'number' },
    { key: 'screen_size', label: 'Screen Size (in)', type: 'number' },
    { key: 'camera_mp', label: 'Camera (MP)', type: 'number' },
  ],
  laptops: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Apple','HP','Dell','Lenovo','Asus','Acer'] },
    { key: 'cpu', label: 'CPU', type: 'select', options: ['Intel i5','Intel i7','Intel i9','Ryzen 5','Ryzen 7'] },
    { key: 'ram', label: 'RAM (GB)', type: 'number' },
    { key: 'storage', label: 'Storage', type: 'select', options: ['256GB','512GB','1TB','2TB'] },
    { key: 'screen_size', label: 'Screen Size (in)', type: 'number' },
  ],
  computers: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['HP','Dell','Lenovo','Asus','Acer','Apple'] },
    { key: 'cpu', label: 'CPU', type: 'select', options: ['Intel i5','Intel i7','Intel i9','Ryzen 5','Ryzen 7'] },
    { key: 'ram', label: 'RAM (GB)', type: 'number' },
    { key: 'storage', label: 'Storage', type: 'select', options: ['256GB','512GB','1TB','2TB'] },
  ],
  tablets: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Apple','Samsung','Lenovo','Huawei'] },
    { key: 'storage', label: 'Storage', type: 'select', options: ['64GB','128GB','256GB','512GB'] },
    { key: 'screen_size', label: 'Screen Size (in)', type: 'number' },
  ],
  'tv-video': [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Samsung','LG','Sony','TCL','Hisense','Philips'] },
    { key: 'screen_size', label: 'Screen Size (in)', type: 'number' },
    { key: 'panel', label: 'Panel Type', type: 'select', options: ['LED','QLED','OLED'] },
    { key: 'resolution', label: 'Resolution', type: 'select', options: ['HD','Full HD','4K','8K'] },
  ],
  'audio-headphones': [
    { key: 'type', label: 'Type', type: 'select', options: ['Headphones','Earbuds','Speaker','Soundbar'] },
    { key: 'connection', label: 'Connection', type: 'select', options: ['Wired','Bluetooth','Wi-Fi'] },
    { key: 'power_watts', label: 'Power (W)', type: 'number' },
  ],
  'cameras-photography': [
    { key: 'type', label: 'Type', type: 'select', options: ['DSLR','Mirrorless','Compact','Action'] },
    { key: 'sensor', label: 'Sensor', type: 'select', options: ['Full Frame','APS-C','Micro Four Thirds'] },
    { key: 'resolution_mp', label: 'Resolution (MP)', type: 'number' },
  ],
  gaming: [
    { key: 'platform', label: 'Platform', type: 'select', options: ['PlayStation','Xbox','Nintendo','PC'] },
    { key: 'storage', label: 'Storage', type: 'select', options: ['512GB','1TB','2TB'] },
  ],
  wearables: [
    { key: 'type', label: 'Type', type: 'select', options: ['Smartwatch','Fitness Tracker'] },
    { key: 'size', label: 'Size', type: 'select', options: ['Small','Medium','Large'] },
  ],
  furniture: [
    { key: 'material', label: 'Material', type: 'select', options: ['Wood','Metal','Glass','Plastic'] },
    { key: 'color', label: 'Color', type: 'select', options: ['Black','White','Brown','Gray'] },
  ],
  'large-appliances': [
    { key: 'energy_rating', label: 'Energy Rating', type: 'select', options: ['A++','A+','A','B'] },
    { key: 'capacity', label: 'Capacity', type: 'number' },
  ],
  'small-appliances': [
    { key: 'power_watts', label: 'Power (W)', type: 'number' },
    { key: 'capacity', label: 'Capacity', type: 'number' },
  ],
  // ===== Grocery =====
  grocery: [
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'weight_grams', label: 'Weight (g)', type: 'number' },
    { key: 'dietary', label: 'Dietary', type: 'select', options: ['Halal','Vegan','Vegetarian','Gluten-free','Organic'] },
  ],
  // ===== Health & Beauty =====
  beauty: [
    { key: 'skin_type', label: 'Skin Type', type: 'select', options: ['All','Dry','Oily','Combination','Sensitive'] },
    { key: 'shade', label: 'Shade', type: 'text' },
    { key: 'volume_ml', label: 'Volume (ml)', type: 'number' },
  ],
  'personal-care': [
    { key: 'scent', label: 'Scent', type: 'text' },
    { key: 'volume_ml', label: 'Volume (ml)', type: 'number' },
  ],
  pharmacy: [
    { key: 'form', label: 'Form', type: 'select', options: ['Tablet','Capsule','Syrup','Cream'] },
    { key: 'dose', label: 'Dose', type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
  ],
  // ===== Sports & Outdoors =====
  'exercise-fitness': [
    { key: 'type', label: 'Type', type: 'select', options: ['Weights','Yoga','Cardio','Accessories'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Steel','Rubber','Foam','Plastic','Wood'] },
    { key: 'weight_kg', label: 'Weight (kg)', type: 'number' },
  ],
  'outdoor-recreation': [
    { key: 'type', label: 'Type', type: 'select', options: ['Camping','Hiking','Cycling','Fishing'] },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'weight_kg', label: 'Weight (kg)', type: 'number' },
  ],
  // ===== Toys & Games =====
  'toys-games': [
    { key: 'age_group', label: 'Age Group', type: 'select', options: ['0-2','3-5','6-8','9-12','13+'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Plastic','Wood','Metal','Fabric'] },
    { key: 'pieces', label: 'Pieces', type: 'number' },
  ],
  // ===== Books & Media =====
  'books-media': [
    { key: 'author', label: 'Author', type: 'text' },
    { key: 'language', label: 'Language', type: 'select', options: ['Arabic','English','French','German'] },
    { key: 'format', label: 'Format', type: 'select', options: ['Paperback','Hardcover','eBook','Audio'] },
  ],
  // ===== Baby =====
  baby: [
    { key: 'age_group', label: 'Age Group', type: 'select', options: ['0-3m','3-6m','6-12m','12-24m','2-4y'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Cotton','Polyester','Bamboo'] },
  ],
  // ===== Pet Supplies =====
  'pet-supplies': [
    { key: 'species', label: 'Species', type: 'select', options: ['Dog','Cat','Bird','Fish','Small Pet'] },
    { key: 'size', label: 'Size', type: 'select', options: ['XS','S','M','L','XL'] },
  ],
  // ===== Office & Stationery =====
  'office-stationery': [
    { key: 'type', label: 'Type', type: 'select', options: ['Notebook','Pen','Paper','Folder','Stapler'] },
    { key: 'pages', label: 'Pages', type: 'number' },
    { key: 'size', label: 'Size', type: 'select', options: ['A4','A5','A6','Letter'] },
  ],
  // ===== Industrial & Tools =====
  'industrial-tools': [
    { key: 'type', label: 'Type', type: 'select', options: ['Drill','Saw','Grinder','Welder'] },
    { key: 'power_watts', label: 'Power (W)', type: 'number' },
    { key: 'voltage', label: 'Voltage', type: 'number' },
    { key: 'material', label: 'Material', type: 'select', options: ['Steel','Aluminum','Plastic'] },
  ],
  // ===== Hardware =====
  hardware: [
    { key: 'type', label: 'Type', type: 'select', options: ['Screw','Nail','Hinge','Handle'] },
    { key: 'size', label: 'Size', type: 'text' },
    { key: 'material', label: 'Material', type: 'select', options: ['Steel','Brass','Aluminum','Plastic'] },
  ],
};
