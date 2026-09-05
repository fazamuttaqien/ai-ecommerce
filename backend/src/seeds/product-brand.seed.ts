import 'dotenv/config';

import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { products } from '../db/schema';

const productBrands: Record<string, string> = {
  'Fresh Red Apples': 'Fresh Farm',
  'Organic Bananas': 'Organic Valley',
  'Fresh Hass Avocado': 'Nature Harvest',
  'Sweet Valencia Oranges': 'SunFresh',
  'Fresh Broccoli Florets': 'Green Valley',
  'Premium Carrots': 'Fresh Farm',
  'Fresh Strawberries': 'Berry Best',
  'Ripe Mangoes': 'Tropical Harvest',
  'Classic Potato Chips': "Lay's",
  'Cheddar Cheese Crackers': 'Ritz',
  'Honey Roasted Peanuts': 'Planters',
  'Chocolate Chip Cookies': 'Oreo',
  'Sea Salt Popcorn': 'Act II',
  'Granola Energy Bars': 'Nature Valley',
  'Whole Wheat Bread': 'Gardenia',
  'Butter Croissant': 'La Boulangerie',
  'Blueberry Muffin': 'Hostess',
  'Cinnamon Roll': 'Cinnabon',
  'Chocolate Fudge Brownie': 'Little Debbie',
  'Fresh Sourdough Loaf': 'Panera',
  'Sparkling Mineral Water': 'Perrier',
  'Fresh Orange Juice': 'Tropicana',
  'Cold Brew Coffee': 'Starbucks',
  'Green Tea Bottled Drink': 'Ito En',
  'Strawberry Yogurt Smoothie': 'Chobani',
  'Classic Cola Drink': 'Coca-Cola',
  'Frozen Margherita Pizza': 'DiGiorno',
  'Frozen Chicken Nuggets': 'Tyson',
  'Frozen Mixed Vegetables': 'Green Giant',
  'Frozen French Fries': 'Ore-Ida',
  'Frozen Berry Mix': 'Dole',
  'Frozen Salmon Fillet': 'SeaPak',
  'Fresh Chicken Breast': 'Tyson',
  'Premium Beef Steak': 'Angus Valley',
  'Fresh White Shrimp': 'SeaPak',
  'Fresh Tuna Fillet': 'Blue Harbor',
  'Jasmine White Rice': 'Royal Umbrella',
  'All-Purpose Wheat Flour': 'King Arthur',
  'Extra Virgin Olive Oil': 'Filippo Berio',
  'Creamy Peanut Butter': 'Jif',
  'Tomato Pasta Sauce': 'Prego',
  'Gentle Baby Shampoo': "Johnson's Baby",
  'Soft Baby Diapers': 'Pampers',
  'Baby Moisturizing Lotion': "Johnson's Baby",
  'Nourishing Hair Conditioner': 'Dove',
  'Refreshing Body Wash': 'Dove',
  'Daily Facial Cleanser': 'Cetaphil',
  'Mint Fresh Toothpaste': 'Colgate',
  'Hydrating Hand Soap': 'Dettol',
};

const seedProductBrands = async () => {
  try {
    const names = Object.keys(productBrands);
    const existing = await db
      .select({ id: products._id, name: products.name })
      .from(products)
      .where(inArray(products.name, names));

    for (const product of existing) {
      await db
        .update(products)
        .set({ brand: productBrands[product.name], updatedAt: new Date() })
        .where(eq(products._id, product.id));
    }

    const missing = names.filter(
      (name) => !existing.some((product) => product.name === name),
    );

    if (missing.length > 0) {
      throw new Error(`Missing products: ${missing.join(', ')}`);
    }

    console.log(`${existing.length} product brands seeded successfully`);
  } catch (error) {
    console.error('Product brand seed failed:', error);
    process.exitCode = 1;
  }
};

seedProductBrands();
