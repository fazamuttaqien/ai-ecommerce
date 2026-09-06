import { tool } from 'ai';
import { z } from 'zod';

import {
  semanticSearchService,
  type SemanticSearchResponse,
} from '../../services/semantic-search.service';

const AI_SEMANTIC_SEARCH_LIMIT = 20;

export const semanticSearchProductsInputSchema = z
  .object({
    query: z.string().trim().min(1).max(500),
    categoryId: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1).optional(),
    minPrice: z.number().finite().min(0).optional(),
    maxPrice: z.number().finite().min(0).optional(),
    limit: z.number().int().min(1).max(AI_SEMANTIC_SEARCH_LIMIT).default(10),
  })
  .superRefine((value, ctx) => {
    if (
      value.minPrice !== undefined &&
      value.maxPrice !== undefined &&
      value.minPrice > value.maxPrice
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxPrice'],
        message: 'maxPrice must be greater than or equal to minPrice',
      });
    }
  });

export type SemanticSearchProductsToolInput = z.infer<
  typeof semanticSearchProductsInputSchema
>;

export type SemanticSearchToolDependencies = {
  search: typeof semanticSearchService.search;
};

const defaultDependencies: SemanticSearchToolDependencies = {
  search: semanticSearchService.search.bind(semanticSearchService),
};

const mapSemanticSearchProducts = (result: SemanticSearchResponse) =>
  result.items.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    slug: product.slug,
    description: product.description,
    image: product.images[0] ?? null,
    salePrice: product.salePrice,
    originalPrice: product.originalPrice,
    discountPercent: product.discountPercent,
    unit: product.unit,
    stockCount: product.stockCount,
    ratingAverage: product.ratingAverage,
    reviewCount: product.reviewCount,
    category: product.category,
    similarity: product.similarity,
  }));

export const executeSemanticSearchProducts = async (
  rawInput: unknown,
  dependencies: SemanticSearchToolDependencies = defaultDependencies,
) => {
  const input = semanticSearchProductsInputSchema.parse(rawInput);

  try {
    const result = await dependencies.search({
      query: input.query,
      page: 1,
      pageSize: input.limit,
      categoryId: input.categoryId,
      brand: input.brand,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
    });

    return {
      products: mapSemanticSearchProducts(result),
    };
  } catch {
    throw new Error('Semantic product search failed. Please try again.');
  }
};

export const createAISemanticSearchTools = (
  dependencies: SemanticSearchToolDependencies = defaultDependencies,
) => ({
  search_products_semantic: tool({
    description:
      'Search active products by semantic meaning, user intent, use case, or natural-language product needs. Use for queries such as products for jogging, programming, hot weather, or photography. Supports optional category, brand, and price filters. Read-only.',
    inputSchema: semanticSearchProductsInputSchema,
    execute: (input) => executeSemanticSearchProducts(input, dependencies),
  }),
});

export const aiSemanticSearchTools = createAISemanticSearchTools();
