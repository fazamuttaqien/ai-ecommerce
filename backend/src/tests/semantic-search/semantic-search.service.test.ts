import assert from 'node:assert/strict';

import {
  SemanticSearchService,
  type SemanticSearchInput,
} from '../../services/semantic-search.service';
import type { SemanticSearchRepositoryResponse } from '../../repositories/semantic-search.repository';

type EmbeddingMock = {
  calls: string[];
  embedQueryOrThrow: (query: string) => Promise<number[]>;
};

const embeddingMock: EmbeddingMock = {
  calls: [],
  async embedQueryOrThrow(query) {
    embeddingMock.calls.push(query);
    return [1, 0, 0];
  },
};

let repositoryInput: {
  embedding: number[];
  page: number;
  pageSize: number;
} | null = null;

const repositoryMock = {
  async search(
    embedding: number[],
    _filters: { categoryId?: string; minPrice?: number; maxPrice?: number },
    page: number,
    pageSize: number,
  ): Promise<SemanticSearchRepositoryResponse> {
    repositoryInput = { embedding, page, pageSize };

    return {
      items: [
        {
          id: 'product-1',
          name: 'Wireless Headphones',
          slug: 'wireless-headphones',
          description: 'Noise cancelling headphones',
          images: [],
          originalPrice: 100,
          salePrice: 80,
          discountPercent: 20,
          unit: 'pc',
          stockCount: 10,
          ratingAverage: 4.5,
          reviewCount: 20,
          category: { id: 'audio', name: 'Audio' },
          similarity: 1.000001,
        },
      ],
      total: 21,
    };
  },
};

const run = async (): Promise<void> => {
  const service = new SemanticSearchService(embeddingMock, repositoryMock);
  const input: SemanticSearchInput = {
    query: '  wireless headphones  ',
    page: 2,
    pageSize: 10,
    categoryId: 'audio',
    minPrice: 50,
    maxPrice: 100,
  };

  const result = await service.search(input);

  assert.deepEqual(embeddingMock.calls, ['wireless headphones']);
  assert.deepEqual(repositoryInput, {
    embedding: [1, 0, 0],
    page: 2,
    pageSize: 10,
  });
  assert.equal(result.items[0]?.similarity, 1);
  assert.deepEqual(result.pagination, {
    page: 2,
    pageSize: 10,
    total: 21,
    totalPages: 3,
    hasNextPage: true,
    hasPreviousPage: true,
  });
};

run()
  .then(() => console.log('Semantic search service tests passed.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
