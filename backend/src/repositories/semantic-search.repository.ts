import { and, asc, count, eq, gte, lte, sql } from 'drizzle-orm';

import { embeddingConfig } from '../config/embedding.config';
import { semanticSearchConfig } from '../config/semantic-search.config';
import { db } from '../db';
import { categories, products, productEmbeddings } from '../db/schema';

export type SemanticSearchFilters = {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type SemanticSearchRepositoryResult = {
  id: string;
  name: string;
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
  similarity: number;
};

export type SemanticSearchRepositoryResponse = {
  items: SemanticSearchRepositoryResult[];
  total: number;
};

export class SemanticSearchRepository {
  async search(
    queryEmbedding: number[],
    filters: SemanticSearchFilters,
    page: number,
    pageSize: number,
  ): Promise<SemanticSearchRepositoryResponse> {
    const offset = (page - 1) * pageSize;
    const queryVector = JSON.stringify(queryEmbedding);
    const distance = sql<number>`${productEmbeddings.embedding} <=> ${queryVector}`;
    const similarity = sql<number>`1 - (${distance})`;

    const conditions = [
      eq(productEmbeddings.model, embeddingConfig.model),
      eq(products.isActive, true),
      gte(similarity, semanticSearchConfig.similarityThreshold),
    ];

    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.salePrice, filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.salePrice, filters.maxPrice));
    }

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: products._id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          images: products.images,
          originalPrice: products.originalPrice,
          salePrice: products.salePrice,
          discountPercent: products.discountPercent,
          unit: products.unit,
          stockCount: products.stockCount,
          ratingAverage: products.ratingAverage,
          reviewCount: products.reviewCount,
          category: {
            id: categories._id,
            name: categories.name,
          },
          similarity,
        })
        .from(productEmbeddings)
        .innerJoin(products, eq(productEmbeddings.productId, products._id))
        .leftJoin(categories, eq(products.categoryId, categories._id))
        .where(and(...conditions))
        .orderBy(asc(distance), asc(products._id))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(productEmbeddings)
        .innerJoin(products, eq(productEmbeddings.productId, products._id))
        .where(and(...conditions)),
    ]);

    return {
      items: rows.map((row) => ({
        ...row,
        similarity: Number(row.similarity),
      })),
      total: Number(totalRows[0]?.count ?? 0),
    };
  }
}

export const semanticSearchRepository = new SemanticSearchRepository();
