import { and, asc, eq, gte, ilike, lte, or } from 'drizzle-orm';

import { db } from '../db';
import { categories, products } from '../db/schema';

export type KeywordProductSearchInput = {
  query: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  candidateLimit?: number;
};

export type KeywordProductSearchResultItem = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  description: string | null;
  images: string[];
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  discountLabel: string | null;
  unit: string;
  stockCount: number;
  ratingAverage: number;
  reviewCount: number;
  category: { id: string; name: string; slug: string } | null;
  similarity: number;
  keywordScore: number;
};

const escapeLikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, (character) => `\\${character}`);

const normalizeText = (value: string): string =>
  value.trim().toLocaleLowerCase();

export const calculateKeywordRelevanceScore = (
  query: string,
  product: Pick<
    KeywordProductSearchResultItem,
    'name' | 'brand' | 'description'
  >,
): number => {
  const normalizedQuery = normalizeText(query);
  const name = normalizeText(product.name);
  const brand = normalizeText(product.brand);
  const description = normalizeText(product.description ?? '');

  if (name === normalizedQuery) return 1;
  if (name.startsWith(normalizedQuery)) return 0.8;
  if (name.includes(normalizedQuery)) return 0.6;
  if (brand.includes(normalizedQuery)) return 0.4;
  if (description.includes(normalizedQuery)) return 0.2;
  return 0;
};

const compareKeywordResults = (
  left: KeywordProductSearchResultItem,
  right: KeywordProductSearchResultItem,
): number =>
  right.keywordScore - left.keywordScore ||
  left.name.localeCompare(right.name) ||
  left.id.localeCompare(right.id);

export class KeywordProductSearchService {
  async search(
    input: KeywordProductSearchInput,
  ): Promise<KeywordProductSearchResultItem[]> {
    const query = input.query.trim();
    if (!query) throw new Error('Keyword search query is required');

    if (
      input.minPrice !== undefined &&
      input.maxPrice !== undefined &&
      input.minPrice > input.maxPrice
    ) {
      throw new Error('minPrice must be less than or equal to maxPrice');
    }

    const candidateLimit = Math.min(
      Math.max(input.candidateLimit ?? 50, 1),
      100,
    );
    const pattern = `%${escapeLikePattern(query)}%`;
    const conditions = [eq(products.isActive, true)];

    if (input.categoryId)
      conditions.push(eq(products.categoryId, input.categoryId));
    if (input.brand) conditions.push(eq(products.brand, input.brand));
    if (input.minPrice !== undefined)
      conditions.push(gte(products.salePrice, input.minPrice));
    if (input.maxPrice !== undefined)
      conditions.push(lte(products.salePrice, input.maxPrice));

    const keywordCondition = or(
      ilike(products.name, pattern),
      ilike(products.description, pattern),
      ilike(products.brand, pattern),
    );

    const rows = await db
      .select({
        id: products._id,
        name: products.name,
        brand: products.brand,
        slug: products.slug,
        description: products.description,
        images: products.images,
        originalPrice: products.originalPrice,
        salePrice: products.salePrice,
        discountPercent: products.discountPercent,
        discountLabel: products.discountLabel,
        unit: products.unit,
        stockCount: products.stockCount,
        ratingAverage: products.ratingAverage,
        reviewCount: products.reviewCount,
        category: {
          id: categories._id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories._id))
      .where(and(...conditions, keywordCondition))
      .orderBy(asc(products._id));

    return rows
      .map((product) => ({
        ...product,
        similarity: 0,
        keywordScore: calculateKeywordRelevanceScore(query, product),
      }))
      .sort(compareKeywordResults)
      .slice(0, candidateLimit);
  }
}

export const keywordProductSearchService = new KeywordProductSearchService();
