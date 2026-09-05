import { embeddingService } from './embedding.service';
import {
  semanticSearchRepository,
  type SemanticSearchFilters,
  type SemanticSearchRepositoryResponse,
} from '../repositories/semantic-search.repository';
import { semanticSearchConfig } from '../config/semantic-search.config';

export type SemanticSearchInput = {
  query: string;
  page?: number;
  pageSize?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type SemanticSearchResultItem = {
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

export type SemanticSearchResponse = {
  items: SemanticSearchResultItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  threshold: number;
};

export class SemanticSearchService {
  async search(input: SemanticSearchInput): Promise<SemanticSearchResponse> {
    const query = input.query.trim();
    const page = input.page ?? semanticSearchConfig.defaultPage;
    const pageSize = Math.min(
      input.pageSize ?? semanticSearchConfig.defaultPageSize,
      semanticSearchConfig.maxPageSize,
    );

    if (!query) {
      throw new Error('Semantic search query is required');
    }

    if (input.minPrice !== undefined && input.maxPrice !== undefined) {
      if (input.minPrice > input.maxPrice) {
        throw new Error('minPrice must be less than or equal to maxPrice');
      }
    }

    const queryEmbedding = await embeddingService.embedQueryOrThrow(query);

    const filters: SemanticSearchFilters = {
      categoryId: input.categoryId,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
    };

    const result = await semanticSearchRepository.search(
      queryEmbedding,
      filters,
      page,
      pageSize,
    );

    return this.normalizeResult(result, page, pageSize);
  }

  private normalizeResult(
    result: SemanticSearchRepositoryResponse,
    page: number,
    pageSize: number,
  ): SemanticSearchResponse {
    const totalPages = Math.ceil(result.total / pageSize);

    return {
      items: result.items.map((item) => ({
        ...item,
        similarity: Math.max(0, Math.min(1, Number(item.similarity))),
      })),
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      threshold: semanticSearchConfig.similarityThreshold,
    };
  }
}

export const semanticSearchService = new SemanticSearchService();
