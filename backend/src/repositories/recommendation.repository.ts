import { and, desc, eq, gt, inArray, ne } from 'drizzle-orm';

import { embeddingConfig } from '../config/embedding.config';
import { db } from '../db';
import {
  cartItems,
  carts,
  categories,
  orderItems,
  orders,
  productEmbeddings,
  productInteractions,
  products,
  reviews,
} from '../db/schema';

export type RecommendationSignal = {
  productId: string;
  weight: number;
};

export type RecommendationProduct = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  description: string | null;
  images: string[];
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  unit: string;
  stockCount: number;
  ratingAverage: number;
  reviewCount: number;
  category: { id: string; name: string } | null;
  embedding: number[] | null;
};

export type RecommendationRepositoryResponse = {
  purchases: RecommendationSignal[];
  interactions: RecommendationSignal[];
  cart: RecommendationSignal[];
  reviews: RecommendationSignal[];
  preferenceProducts: RecommendationProduct[];
  candidates: RecommendationProduct[];
};

export class RecommendationRepository {
  async getUserRecommendationData(userId: string, candidateLimit: number, preferenceSeedLimit: number): Promise<RecommendationRepositoryResponse> {
    const [purchases, interactions, cart, userReviews] = await Promise.all([
      db.select({ productId: orderItems.productId, quantity: orderItems.quantity }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders._id)).where(and(eq(orders.userId, userId), ne(orders.status, 'cancelled'))),
      db.select({ productId: productInteractions.productId, type: productInteractions.type }).from(productInteractions).where(eq(productInteractions.userId, userId)).orderBy(desc(productInteractions.createdAt)),
      db.select({ productId: cartItems.productId, quantity: cartItems.quantity }).from(cartItems).innerJoin(carts, eq(cartItems.cartId, carts._id)).where(eq(carts.userId, userId)),
      db.select({ productId: reviews.productId, rating: reviews.rating }).from(reviews).where(eq(reviews.userId, userId)),
    ]);

    const aggregate = (rows: Array<{ productId: string; weight: number }>): RecommendationSignal[] => {
      const map = new Map<string, number>();
      for (const row of rows) map.set(row.productId, (map.get(row.productId) ?? 0) + row.weight);
      return [...map.entries()].map(([productId, weight]) => ({ productId, weight }));
    };

    const purchaseSignals = aggregate(purchases.map((row) => ({ productId: row.productId, weight: Math.max(1, row.quantity) })));
    const interactionSignals = aggregate(interactions.map((row) => ({ productId: row.productId, weight: row.type === 'homepage_click' ? 2 : 1 })));
    const cartSignals = aggregate(cart.map((row) => ({ productId: row.productId, weight: Math.max(1, row.quantity) })));
    const reviewSignals = aggregate(userReviews.filter((row) => row.rating >= 4).map((row) => ({ productId: row.productId, weight: row.rating / 5 })));

    const seedIds = [...new Set([
      ...purchaseSignals.map((item) => item.productId),
      ...interactionSignals.map((item) => item.productId),
      ...cartSignals.map((item) => item.productId),
      ...reviewSignals.map((item) => item.productId),
    ])].slice(0, preferenceSeedLimit);

    const [preferenceProducts, candidates] = await Promise.all([
      seedIds.length
        ? db.select({
            id: products._id, name: products.name, brand: products.brand, slug: products.slug,
            description: products.description, images: products.images, originalPrice: products.originalPrice,
            salePrice: products.salePrice, discountPercent: products.discountPercent, unit: products.unit,
            stockCount: products.stockCount, ratingAverage: products.ratingAverage, reviewCount: products.reviewCount,
            category: { id: categories._id, name: categories.name }, embedding: productEmbeddings.embedding,
          }).from(products).leftJoin(categories, eq(products.categoryId, categories._id)).leftJoin(productEmbeddings, and(eq(productEmbeddings.productId, products._id), eq(productEmbeddings.model, embeddingConfig.model))).where(inArray(products._id, seedIds))
        : Promise.resolve([]),
      db.select({
        id: products._id, name: products.name, brand: products.brand, slug: products.slug,
        description: products.description, images: products.images, originalPrice: products.originalPrice,
        salePrice: products.salePrice, discountPercent: products.discountPercent, unit: products.unit,
        stockCount: products.stockCount, ratingAverage: products.ratingAverage, reviewCount: products.reviewCount,
        category: { id: categories._id, name: categories.name }, embedding: productEmbeddings.embedding,
      }).from(products).leftJoin(categories, eq(products.categoryId, categories._id)).leftJoin(productEmbeddings, and(eq(productEmbeddings.productId, products._id), eq(productEmbeddings.model, embeddingConfig.model))).where(and(eq(products.isActive, true), gt(products.stockCount, 0))).orderBy(desc(products.reviewCount), desc(products.ratingAverage), desc(products._id)).limit(candidateLimit),
    ]);

    return { purchases: purchaseSignals, interactions: interactionSignals, cart: cartSignals, reviews: reviewSignals, preferenceProducts: preferenceProducts as RecommendationProduct[], candidates: candidates as RecommendationProduct[] };
  }
}

export const recommendationRepository = new RecommendationRepository();
