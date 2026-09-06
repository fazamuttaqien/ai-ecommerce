import 'dotenv/config';
import slugify from 'slugify';
import { db } from '../db';
import { categories } from '../db/schema';

const categoriesData = [
  ['Technology', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 'Computers, mobile devices, accessories, and everyday technology.'],
  ['Clothing & Fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80', 'Comfortable everyday clothing, activewear, and casual fashion.'],
  ['Fruits & Vegetables', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', 'Fresh fruits and vegetables for healthy meals, snacks, and smoothies.'],
  ['Food & Beverages', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', 'Everyday snacks, drinks, and convenient food for work and home.'],
  ['Personal Care', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80', 'Daily personal hygiene, skincare, and grooming essentials.'],
] as const;

const seedCategories = async () => {
  try {
    await db.delete(categories);
    const rows = categoriesData.map(([name, imageUrl, description]) => ({
      name,
      imageUrl,
      description,
      isActive: true,
      slug: slugify(name, { lower: true, strict: true }),
    }));
    const created = await db.insert(categories).values(rows).returning();
    console.log(`${created.length} categories seeded successfully`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  }
};

void seedCategories();
