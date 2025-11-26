import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import db from '../config/Database.js';
import { BlogCategory } from '../models/blogModel.js';
import { initializeRelations } from '../models/index.js';

(async () => {
  try {
    const filePath = path.join(process.cwd(), 'backend', 'config', 'blogStaticCategories.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const categories = JSON.parse(raw);

    await db.authenticate();
    initializeRelations && initializeRelations();
    await db.sync();

    for (const cat of categories) {
      const existing = await BlogCategory.findOne({ where: { category_id: cat.category_id } });
      if (existing) {
        await existing.update({ ...cat });
        console.log(`Updated: ${cat.category_id} (${cat.name})`);
      } else {
        await BlogCategory.create(cat);
        console.log(`Created: ${cat.category_id} (${cat.name})`);
      }
    }
    console.log('Static blog categories synchronized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
})();
