import dotenv from 'dotenv';
dotenv.config();
import db from '../config/Database.js';
import { BlogCategory } from '../models/blogModel.js';
import { initializeRelations } from '../models/index.js';

(async () => {
  try {
    await db.authenticate();
    initializeRelations && initializeRelations();
    await db.sync();

    const defaults = [
      { category_id: 'BLC_FOOD', name: 'Kuliner', slug: 'kuliner', description: 'Tips & info kuliner', color: '#6366f1', active: true },
      { category_id: 'BLC_TIPS', name: 'Tips Dapur', slug: 'tips-dapur', description: 'Tips memasak dan penyimpanan', color: '#6366f1', active: true },
      { category_id: 'BLC_RESEP', name: 'Resep Cakalang', slug: 'resep-cakalang', description: 'Kumpulan resep olahan cakalang', color: '#6366f1', active: true }
    ];

    for (const cat of defaults) {
      const existing = await BlogCategory.findOne({ where: { category_id: cat.category_id } });
      if (existing) {
        await existing.update({ ...cat });
        console.log(`Updated category ${cat.category_id}`);
      } else {
        await BlogCategory.create(cat);
        console.log(`Created category ${cat.category_id}`);
      }
    }

    console.log('Seed blog categories completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
