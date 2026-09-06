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

type KeywordSearchResultItem = Awaited<ReturnType<typeof getProductsService>>['products'][number];
type KeywordSearchResult = KeywordSearchResultItem & {
  description: string | null;
  category: { id: string; name: string; slug: string } | null;
};
type SemanticSearchResult = SemanticSearchResultItem;

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
  unit: string;
  stockCount: number;
  ratingAverage: number;
  reviewCount: number;
  category: { id: string; name: string; slug?: string } | null;
  similarity: number;
  discountLabel?: string | null;
};

export type HybridSearchResultItem = HybridProduct & {
  keywordScore: number;
  semanticScore: number;
  hybridScore: number;
};

const normalizeRankScore = (index: number, total: number): number =>
  total <= 1 ? 1 : 1 - index / (total - 1);

const normalizeKeywordResult = (product: KeywordSearchResultItem): KeywordSearchResult => ({
  ...product,
  id: product._id,
  description: null,
  category: product.category
    ? {
        id: product.category._id,
        name: product.category.name,
        slug: product.category.slug,
      }
    : null,
});

const normalizeSemanticResult = (product: SemanticSearchResult): SemanticSearchResult => product;

const toHybridProduct = (
  product: KeywordSearchResult | SemanticSearchResult,
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
  unit: product.unit,
  stockCount: product.stockCount,
  ratingAverage: product.ratingAverage,
  reviewCount: product.reviewCount,
  category: product.category,
  similarity: product.similarity,
  ...('discountLabel' in product ? { discountLabel: product.discountLabel } : {}),
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

    const [keywordResult, semanticResult] = await Promise.all([
      getProductsService({
        keyword: query,
        categoryId: input.categoryId,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        page: 1,
        limit: candidateLimit,
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
    const keywordItems = keywordResult.products.map(normalizeKeywordResult);
    const semanticItems = semanticResult.items.map(normalizeSemanticResult);

    keywordItems.forEach((product, index) => {
      const keywordScore = normalizeRankScore(index, keywordItems.length);
      const hybridProduct = toHybridProduct(product);
      merged.set(product.id, {
        ...hybridProduct,
        keywordScore,
        semanticScore: 0,
        hybridScore: keywordScore * hybridSearchConfig.keywordWeight,
      });
    });

    semanticItems.forEach((product) => {
      const existing = merged.get(product.id);
      const keywordScore = existing?.keywordScore ?? 0;
      const semanticScore = product.similarity;
      const hybridProduct = toHybridProduct(product);

      merged.set(product.id, {
        ...(existing ?? {}),
        ...hybridProduct,
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
          b.hybridScore - a.hybridScore ||
          a.name.localeCompare(b.name) ||
          a.id.localeCompare(b.id),
      )
      .slice(0, limit);
  }
}

export const hybridSearchService = new HybridSearchService();
