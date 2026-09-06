import 'dotenv/config';
import slugify from 'slugify';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { categories, products, users } from '../db/schema';

type ProductSeed = readonly [string, string, string, string, number, number, number, string];

const productsData: readonly ProductSeed[] = [
  ['Developer Pro Laptop 14', 'Technology', 'NovaTech', 'A lightweight laptop for programmers, students, and professionals. It combines a responsive multi-core processor, 16 GB memory, fast SSD storage, comfortable keyboard, and sharp display for coding, documentation, video calls, web browsing, and everyday multitasking.', 899.99, 10, 18, 'pc'],
  ['CreatorBook 16 Laptop', 'Technology', 'PixelForge', 'A large-screen laptop for photo editing, video production, interface design, and demanding desktop applications. The spacious display, dedicated graphics capability, generous memory, and fast storage make it useful for creative work as well as software development and office productivity.', 1299.99, 8, 12, 'pc'],
  ['Vision X5 Smartphone', 'Technology', 'NovaTech', 'A versatile smartphone for photography, communication, navigation, streaming, and mobile productivity. It features a bright OLED display, capable multi-camera system, generous storage, long battery life, and fast charging for travel, social media, entertainment, and everyday work.', 649.99, 12, 25, 'pc'],
  ['SoundWave ANC Headphones', 'Technology', 'SoundWave', 'Wireless over-ear headphones for focused work, commuting, study, music, podcasts, movies, and online meetings. Active noise cancellation reduces surrounding distractions while cushioned ear cups and long battery life support comfortable extended listening.', 179.99, 15, 30, 'pc'],
  ['UltraFit Smartwatch', 'Technology', 'FitCore', 'A practical smartwatch for tracking daily activity, workouts, sleep routines, heart-rate trends, and notifications. Its lightweight design, bright touch display, water resistance, and multi-day battery make it suitable for exercise, commuting, and everyday use.', 149.99, 10, 22, 'pc'],
  ['4K Productivity Monitor 27', 'Technology', 'ViewPoint', 'A 27-inch 4K monitor for developers, designers, analysts, and professionals who need sharp text and a spacious desktop. High resolution provides clear application windows and detailed visuals, while the adjustable stand supports comfortable long work and study sessions.', 329.99, 10, 14, 'pc'],
  ['Everyday Cotton T-Shirt', 'Clothing & Fashion', 'UrbanThread', 'A soft everyday cotton T-shirt for casual outfits, campus activities, travel, and relaxed weekends. Breathable fabric feels comfortable in warm weather, while the simple regular fit pairs easily with jeans, chinos, shorts, and casual sneakers.', 24.99, 10, 60, 'pc'],
  ['Performance Running T-Shirt', 'Clothing & Fashion', 'ActivePeak', 'A lightweight athletic shirt for running, jogging, gym sessions, and high-movement activities. Breathable fabric helps manage moisture and the flexible cut allows comfortable movement, making it suitable for long runs, interval training, and outdoor exercise in warm conditions.', 39.99, 15, 45, 'pc'],
  ['Relaxed Linen Shirt', 'Clothing & Fashion', 'UrbanThread', 'A relaxed linen shirt made for hot and humid days when airflow and comfort matter. Its lightweight fabric and loose silhouette work well for vacations, casual offices, weekend gatherings, and everyday summer outfits while maintaining a clean understated appearance.', 54.99, 8, 35, 'pc'],
  ['Slim Stretch Chino Pants', 'Clothing & Fashion', 'ModernFit', 'Versatile stretch chino pants that bridge casual and smart-casual clothing. Flexible fabric provides comfort while sitting, walking, or commuting, while the clean silhouette works with polo shirts, button-down shirts, T-shirts, and casual shoes.', 59.99, 10, 32, 'pc'],
  ['Lightweight Windbreaker Jacket', 'Clothing & Fashion', 'TrailWear', 'A lightweight windbreaker for commuting, travel, morning walks, and outdoor activities where protection from wind or light weather is useful. It packs easily into a small bag and layers comfortably over T-shirts or activewear without the bulk of a heavy jacket.', 74.99, 12, 24, 'pc'],
  ['Everyday Walking Sneakers', 'Clothing & Fashion', 'StepWell', 'Comfort-focused walking sneakers for commuting, shopping, travel, and daily city movement. A cushioned sole and breathable upper support repeated use, while neutral styling makes the shoes easy to pair with jeans, chinos, shorts, and casual athletic clothing.', 79.99, 10, 28, 'pair'],
  ['Trail Running Shoes', 'Clothing & Fashion', 'TrailWear', 'Durable running shoes for outdoor trails, long-distance jogging, and mixed terrain. The supportive midsole provides cushioning for extended movement while the textured outsole improves traction on dirt paths and uneven surfaces, giving runners more protection than ordinary road shoes.', 119.99, 15, 20, 'pair'],
  ['Sweet Red Apples', 'Fruits & Vegetables', 'Fresh Farm', 'Crisp, juicy red apples with naturally sweet flavor and refreshing texture. They are convenient for breakfast, lunch boxes, office snacks, or slicing into salads and desserts. Their firm flesh makes them a useful everyday fruit for families.', 4.99, 0, 100, 'kg'],
  ['Organic Bananas', 'Fruits & Vegetables', 'Organic Valley', 'Naturally sweet bananas with soft texture for breakfast, smoothies, snacks, and baking. They are easy to eat on the go and combine well with oats, yogurt, peanut butter, or other fruit when preparing a quick and filling meal.', 3.49, 10, 75, 'kg'],
  ['Creamy Hass Avocado', 'Fruits & Vegetables', 'Nature Harvest', 'Ripe Hass avocados with creamy texture and mild flavor, suitable for toast, salads, sandwiches, guacamole, and smoothies. Their rich texture makes them useful in savory recipes and breakfast dishes when you want a filling fresh ingredient.', 6.99, 5, 60, 'kg'],
  ['Sweet Valencia Oranges', 'Fruits & Vegetables', 'SunFresh', 'Juicy Valencia oranges with bright citrus flavor and refreshing sweetness. They can be eaten fresh, squeezed into juice, or added to fruit salads and breakfast bowls. Their fragrant flavor is especially suitable for refreshing drinks and warm-weather snacks.', 4.49, 0, 90, 'kg'],
  ['Fresh Broccoli Florets', 'Fruits & Vegetables', 'Green Valley', 'Fresh green broccoli florets prepared for convenient cooking. They work well steamed, roasted, stir-fried, or added to soups, pasta, rice dishes, and meal-prep containers, making them a versatile vegetable for families and everyday meals.', 3.99, 8, 45, 'kg'],
  ['Ripe Sweet Strawberries', 'Fruits & Vegetables', 'Berry Best', 'Sweet ripe strawberries with bright aroma and juicy texture. They are ideal for breakfast bowls, smoothies, desserts, yogurt, fruit salads, and simple snacks. They pair particularly well with bananas, oats, and yogurt in refreshing smoothies.', 5.99, 12, 40, 'kg'],
  ['Tropical Ripe Mangoes', 'Fruits & Vegetables', 'Tropical Harvest', 'Sweet ripe mangoes with fragrant tropical flavor and soft juicy flesh. They are excellent for fresh snacks, smoothies, fruit salads, desserts, and chilled drinks, especially when you want a naturally sweet ingredient for a refreshing warm-weather recipe.', 5.49, 0, 55, 'kg'],
  ['Classic Potato Chips', 'Food & Beverages', "Lay's", 'Crispy thin-cut potato chips with classic savory and lightly salted flavor. They are convenient for movie nights, casual gatherings, office snacks, picnics, and quick breaks when you want a crunchy ready-to-eat snack without preparation.', 2.49, 10, 120, 'pc'],
  ['Oat Granola Energy Bars', 'Food & Beverages', 'Nature Valley', 'Convenient oat and nut-based snack bars for busy mornings, commuting, hiking, study sessions, and afternoon breaks. Their compact format makes them easy to carry when you need a practical snack without preparing a full meal.', 4.59, 10, 65, 'pc'],
  ['Smooth Cold Brew Coffee', 'Food & Beverages', 'Starbucks', 'A smooth ready-to-drink cold brew coffee for work, study, commuting, or afternoon breaks. Its chilled bottled format requires no brewing equipment and can be enjoyed directly from the refrigerator when you want a convenient coffee beverage.', 4.99, 10, 50, 'pc'],
  ['Frozen Margherita Pizza', 'Food & Beverages', 'DiGiorno', 'A convenient frozen Margherita pizza with tomato sauce, mozzarella, and a simple savory profile. It is designed for quick home meals when you want something easy to prepare after work or during a relaxed evening without cooking a full recipe from scratch.', 8.99, 20, 35, 'pc'],
  ['Premium Frozen Salmon Fillet', 'Food & Beverages', 'SeaHarvest', 'Premium frozen salmon fillets suitable for grilling, pan-searing, baking, and simple home meal preparation. The frozen format makes it easy to keep a versatile seafood ingredient available for weeknight dinners, rice bowls, salads, and vegetable-based meals.', 12.99, 10, 25, 'pc'],
  ['Gentle Daily Facial Cleanser', 'Personal Care', 'Cetaphil', 'A gentle facial cleanser for everyday skincare routines. It helps remove ordinary dirt, excess oil, and daily residue without being positioned as a harsh treatment product. It fits a basic routine before moisturizer or other skincare steps.', 8.99, 15, 35, 'pc'],
  ['Hydrating Body Wash', 'Personal Care', 'Dove', 'A moisturizing body wash for daily showers and regular personal hygiene. Its creamy cleansing format suits people who prefer a comfortable shower routine and want a practical product for everyday use after exercise, work, or outdoor activities.', 7.49, 5, 50, 'pc'],
  ['Nourishing Hair Conditioner', 'Personal Care', 'Dove', 'A daily hair conditioner for a softer and smoother hair-care routine. It is useful after shampooing when hair feels dry or difficult to manage, and it fits simple morning or evening grooming routines without requiring a complicated multi-step process.', 6.99, 10, 45, 'pc'],
  ['Fresh Mint Toothpaste', 'Personal Care', 'Colgate', 'A mint-flavored toothpaste intended for routine oral hygiene. It provides a familiar fresh sensation after brushing and is designed as an everyday bathroom essential for morning and evening brushing rather than a specialized dental treatment.', 3.99, 0, 75, 'pc'],
  ['Daily Mineral Sunscreen SPF 50', 'Personal Care', 'SunGuard', 'A lightweight daily sunscreen for outdoor routines such as commuting, walking, travel, and recreation. The high-SPF format is useful for people who want a dedicated sun-protection step before spending time outside during bright daytime conditions.', 14.99, 12, 30, 'pc'],
  ['Soothing Aloe Body Lotion', 'Personal Care', 'PureCare', 'A lightweight body lotion with an aloe-inspired soothing profile for everyday moisturizing after showers or whenever skin feels dry. It is convenient for simple daily grooming routines and can be used on arms, legs, and other areas needing regular moisturization.', 9.49, 8, 38, 'pc'],
];

const seedProducts = async () => {
  try {
    const admin = await db.select({ id: users._id }).from(users).where(eq(users.role, 'admin')).limit(1);
    const adminId = admin[0]?.id;
    if (!adminId) throw new Error('No admin user found. Create an admin user before running the product seed.');

    const categoryNames = [...new Set(productsData.map((product) => product[1]))];
    const categoryRows = await db.select({ id: categories._id, name: categories.name }).from(categories).where(inArray(categories.name, categoryNames));
    const categoryMap = new Map(categoryRows.map((category) => [category.name, category.id]));
    const missing = categoryNames.filter((name) => !categoryMap.has(name));
    if (missing.length) throw new Error(`Missing categories: ${missing.join(', ')}. Run "pnpm seed:categories" first.`);

    await db.delete(products);
    const rows = productsData.map(([name, category, brand, description, originalPrice, discountPercent, stockCount, unit]) => {
      const categoryId = categoryMap.get(category);
      if (!categoryId) throw new Error(`Category not found: ${category}`);
      return { userId: adminId, categoryId, name, brand, slug: slugify(name, { lower: true, strict: true }), description, images: [], originalPrice, salePrice: originalPrice * (1 - discountPercent / 100), discountPercent, discountLabel: discountPercent > 0 ? `${discountPercent}% OFF` : null, stockCount, unit, isActive: true, ratingAverage: 0, reviewCount: 0 };
    });
    const created = await db.insert(products).values(rows).returning({ id: products._id });
    console.log(`${created.length} products seeded successfully`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  }
};

void seedProducts();
