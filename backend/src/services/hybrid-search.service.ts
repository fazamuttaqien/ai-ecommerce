import {
  keywordProductSearchService,
  type KeywordProductSearchResultItem,
} from './keyword-product-search.service';
import {
  semanticSearchService,
  type SemanticSearchResultItem,
} from './semantic-search.service';
import { hybridSearchConfig } from '../config/hybrid-search.config';

export type HybridSearchInput = {
  query: string;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
};

type HybridProduct = {
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
  category: { id: string; name: string; slug?: string } | null;
  similarity: number;
};

export type HybridSearchResultItem = HybridProduct & {
  keywordScore: number;
  semanticScore: number;
  hybridScore: number;
};

const toHybridProduct = (
  product: KeywordProductSearchResultItem | SemanticSearchResultItem,
): HybridProduct => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  slug: product.slug,
  description: product.description,
  images: product.images,
  originalPrice: product.originalPrice,
  salePrice: product.salePrice,
  discountPercent: product.discountPercent,
  discountLabel: 'discountLabel' in product ? product.discountLabel : null,
  unit: product.unit,
  stockCount: product.stockCount,
  ratingAverage: product.ratingAverage,
  reviewCount: product.reviewCount,
  category: product.category,
  similarity: product.similarity,
});

const mergeHybridProduct = (
  existing: HybridProduct,
  incoming: HybridProduct,
): HybridProduct => ({
  ...existing,
  ...incoming,
  description: incoming.description ?? existing.description,
  discountLabel: incoming.discountLabel ?? existing.discountLabel,
  category: incoming.category ?? existing.category,
});

export class HybridSearchService {
  async search(input: HybridSearchInput): Promise<HybridSearchResultItem[]> {
    const query = input.query.trim();
    if (!query) throw new Error('Hybrid search query is required');
    if (
      input.minPrice !== undefined &&
      input.maxPrice !== undefined &&
      input.minPrice > input.maxPrice
    ) {
      throw new Error('minPrice must be less than or equal to maxPrice');
    }

    const limit = Math.min(Math.max(input.limit ?? 10, 1), 20);
    const candidateLimit = Math.max(limit, hybridSearchConfig.candidateLimit);

    const [keywordItems, semanticResult] = await Promise.all([
      keywordProductSearchService.search({
        query,
        categoryId: input.categoryId,
        brand: input.brand,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        candidateLimit,
      }),
      semanticSearchService.search({
        query,
        categoryId: input.categoryId,
        brand: input.brand,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        page: 1,
        pageSize: candidateLimit,
      }),
    ]);

    const merged = new Map<string, HybridSearchResultItem>();

    for (const product of keywordItems) {
      const hybridProduct = toHybridProduct(product);
      const keywordScore = product.keywordScore;

      merged.set(product.id, {
        ...hybridProduct,
        keywordScore,
        semanticScore: 0,
        hybridScore: keywordScore * hybridSearchConfig.keywordWeight,
      });
    }

    for (const product of semanticResult.items) {
      const existing = merged.get(product.id);
      const keywordScore = existing?.keywordScore ?? 0;
      const semanticScore = product.similarity;
      const hybridProduct = toHybridProduct(product);
      const mergedProduct = existing
        ? mergeHybridProduct(existing, hybridProduct)
        : hybridProduct;

      merged.set(product.id, {
        ...mergedProduct,
        keywordScore,
        semanticScore,
        hybridScore:
          keywordScore * hybridSearchConfig.keywordWeight +
          semanticScore * hybridSearchConfig.semanticWeight,
      });
    }

    return [...merged.values()]
      .sort(
        (a, b) =>
          b.hybridScore - a.hybridScore ||
          b.semanticScore - a.semanticScore ||
          b.keywordScore - a.keywordScore ||
          a.name.localeCompare(b.name) ||
          a.id.localeCompare(b.id),
      )
      .slice(0, limit);
  }
}

export const hybridSearchService = new HybridSearchService();
