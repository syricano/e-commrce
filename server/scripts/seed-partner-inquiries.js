// server/scripts/seed-partner-inquiries.js
import sequelize from '../db/index.js';
import applyAssociations from '../db/association.js';
import PartnerInquiry from '../models/PartnerInquiry.js';

const SAMPLES = [
  {
    name: 'Ali Store', email: 'ali@example.com', phone: '+971500000001',
    businessField: 'Electronics', country: 'AE', city: 'Dubai', address: 'Sheikh Zayed Rd',
    shippingOptions: ['shipping','pickup'], preferredPayments: ['cash','online'],
    message: 'Looking to list phones and accessories.'
  },
  {
    name: 'Sara Fashion', email: 'sara@example.com', phone: '+966500000002',
    businessField: 'Fashion & Apparel', country: 'SA', city: 'Riyadh', address: 'Olaya St',
    shippingOptions: ['shipping'], preferredPayments: ['cash','invoice'],
    message: 'Clothing and handbags shop.'
  },
  {
    name: 'Motors Co', email: 'motors@example.com', phone: '+973300000003',
    businessField: 'Automotive', country: 'BH', city: 'Manama', address: 'Exhibition Ave',
    shippingOptions: ['pickup'], preferredPayments: ['bank'],
    message: 'Spare parts and accessories.'
  },
];

async function main(){
  try{
    await sequelize.authenticate();
    applyAssociations();
    let created = 0;
    for (const p of SAMPLES){
      const ex = await PartnerInquiry.findOne({ where:{ email: p.email } });
      if (!ex) { await PartnerInquiry.create(p); created++; }
    }
    console.log(`Seeded ${created} partner inquiries`);
    process.exit(0);
  }catch(e){
    console.error('Seed partner inquiries failed', e);
    process.exit(1);
  }
}

main();

