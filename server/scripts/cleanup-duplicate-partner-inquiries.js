// server/scripts/cleanup-duplicate-partner-inquiries.js
import sequelize from '../db/index.js';
import applyAssociations from '../db/association.js';
import PartnerInquiry from '../models/PartnerInquiry.js';

const keyOf = (r) => `${String(r.email||'').trim().toLowerCase()}|${String(r.message||'').trim().toLowerCase()}`;

async function main(){
  try{
    await sequelize.authenticate();
    applyAssociations();
    const rows = await PartnerInquiry.findAll({ order:[['id','DESC']] });
    const seen = new Set();
    let removed = 0;
    for (const r of rows){
      const k = keyOf(r);
      if (seen.has(k)) { await r.destroy(); removed++; }
      else seen.add(k);
    }
    console.log(`Removed ${removed} duplicate partner inquiries`);
    process.exit(0);
  }catch(e){
    console.error('Cleanup failed', e);
    process.exit(1);
  }
}

main();

