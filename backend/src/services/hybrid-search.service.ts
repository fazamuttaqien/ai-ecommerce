import { getProductsService } from './product.service';
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

export type HybridSearchResultItem = SemanticSearchResultItem & {
  keywordScore: number;
  semanticScore: number;
  hybridScore: number;
};

const normalizeRankScore = (index: number, total: number): number =>
  total <= 1 ? 1 : 1 - index / (total - 1);

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

    const [keywordResult, semanticResult] = await Promise.all([
      getProductsService({
        keyword: query,
        categoryId: input.categoryId,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        page: 1,
        limit: candidateLimit,
      } as Parameters<typeof getProductsService>[0]),
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
    const keywordItems = keywordResult.products;
    const semanticItems = semanticResult.items;

    keywordItems.forEach((product, index) => {
      const id = product._id;
      const keywordScore = normalizeRankScore(index, keywordItems.length);
      merged.set(id, {
        ...product,
        description: null,
        category: null,
        similarity: 0,
        keywordScore,
        semanticScore: 0,
        hybridScore: keywordScore * hybridSearchConfig.keywordWeight,
      });
    });

    semanticItems.forEach((product, index) => {
      const keywordScore = merged.get(product.id)?.keywordScore ?? 0;
      const semanticScore = Math.max(
        product.similarity,
        normalizeRankScore(index, semanticItems.length),
      );
      const existing = merged.get(product.id);
      merged.set(product.id, {
        ...(existing ?? {
          ...product,
          keywordScore,
        }),
        ...product,
        keywordScore,
        semanticScore,
        hybridScore:
          keywordScore * hybridSearchConfig.keywordWeight +
          semanticScore * hybridSearchConfig.semanticWeight,
      });
    });

    return [...merged.values()]
      .sort(
        (a, b) =>
          b.hybridScore - a.hybridScore || a.id.localeCompare(b.id),
      )
      .slice(0, limit);
  }
}

export const hybridSearchService = new HybridSearchService();
