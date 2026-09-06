import assert from 'node:assert/strict';

import {
  HybridSearchService,
  type HybridSearchResultItem,
} from '../../services/hybrid-search.service';
import type { KeywordProductSearchResultItem } from '../../services/keyword-product-search.service';
import type { SemanticSearchResultItem } from '../../services/semantic-search.service';

type TestProduct = {
  id: string;
  name: string;
  keywordScore?: number;
  similarity?: number;
};

const product = ({
  id,
  name,
  keywordScore = 0,
  similarity = 0,
}: TestProduct): KeywordProductSearchResultItem & SemanticSearchResultItem => ({
  id,
  name,
  brand: 'Test Brand',
  slug: id,
  description: 'Test product',
  images: [],
  originalPrice: 100,
  salePrice: 80,
  discountPercent: 20,
  discountLabel: null,
  unit: 'pc',
  stockCount: 10,
  ratingAverage: 4.5,
  reviewCount: 10,
  category: { id: 'category-1', name: 'Test Category', slug: 'test-category' },
  similarity,
  keywordScore,
});

const config = (keywordWeight = 0.5, semanticWeight = 0.5) => ({
  keywordWeight,
  semanticWeight,
  candidateLimit: 50,
});

const createService = (
  keywordItems: KeywordProductSearchResultItem[],
  semanticItems: SemanticSearchResultItem[],
  searchConfig = config(),
): HybridSearchService =>
  new HybridSearchService(
    { async search() { return keywordItems; } },
    {
      async search() {
        return {
          items: semanticItems,
          pagination: {
            page: 1,
            pageSize: searchConfig.candidateLimit,
            total: semanticItems.length,
            totalPages: semanticItems.length ? 1 : 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      },
    },
    searchConfig,
  );

const ids = (items: HybridSearchResultItem[]): string[] =>
  items.map((item) => item.id);

const assertHybridScore = (
  item: HybridSearchResultItem,
  keywordWeight: number,
  semanticWeight: number,
): void => {
  const expected =
    item.keywordScore * keywordWeight + item.semanticScore * semanticWeight;
  assert.equal(item.hybridScore, expected);
};

const run = async (): Promise<void> => {
  // 1. Query kosong ditolak.
  await assert.rejects(
    () => createService([], []).search({ query: '   ' }),
    /Hybrid search query is required/,
  );

  // 2. Keyword search menghasilkan produk.
  {
    const result = await createService([
      product({ id: 'keyword-1', name: 'Sepatu Running', keywordScore: 1 }),
    ], []).search({ query: 'sepatu running' });
    assert.deepEqual(ids(result), ['keyword-1']);
    assert.equal(result[0]?.keywordScore, 1);
    assert.equal(result[0]?.semanticScore, 0);
  }

  // 3. Semantic search menghasilkan produk.
  {
    const result = await createService([], [
      product({ id: 'semantic-1', name: 'Sepatu Trail', similarity: 0.9 }),
    ]).search({ query: 'sepatu untuk lari jarak jauh' });
    assert.deepEqual(ids(result), ['semantic-1']);
    assert.equal(result[0]?.semanticScore, 0.9);
    assert.equal(result[0]?.keywordScore, 0);
  }

  // 4. Salah satu source kosong.
  {
    const keywordOnly = await createService([
      product({ id: 'keyword-only', name: 'Laptop Murah', keywordScore: 0.8 }),
    ], []).search({ query: 'laptop' });
    const semanticOnly = await createService([], [
      product({ id: 'semantic-only', name: 'Laptop Programming', similarity: 0.8 }),
    ]).search({ query: 'laptop programming' });
    assert.deepEqual(ids(keywordOnly), ['keyword-only']);
    assert.deepEqual(ids(semanticOnly), ['semantic-only']);
  }

  // 5. Kedua source kosong.
  assert.deepEqual(
    await createService([], []).then(() => []),
    [],
  );
  assert.deepEqual(
    ids(await createService([], []).search({ query: 'produk tidak ada' })),
    [],
  );

  // 6. Produk yang sama muncul di kedua source.
  {
    const result = await createService(
      [product({ id: 'same', name: 'iPhone 15', keywordScore: 1 })],
      [product({ id: 'same', name: 'iPhone 15', similarity: 0.8 })],
    ).search({ query: 'iPhone 15' });
    assert.deepEqual(ids(result), ['same']);
    assert.equal(result[0]?.keywordScore, 1);
    assert.equal(result[0]?.semanticScore, 0.8);
  }

  // 7. Tidak ada duplicate id.
  {
    const result = await createService(
      [
        product({ id: 'same', name: 'iPhone 15', keywordScore: 1 }),
        product({ id: 'keyword-only', name: 'Case iPhone', keywordScore: 0.6 }),
      ],
      [
        product({ id: 'same', name: 'iPhone 15', similarity: 0.8 }),
        product({ id: 'semantic-only', name: 'Smartphone', similarity: 0.7 }),
      ],
    ).search({ query: 'iPhone 15' });
    assert.equal(new Set(ids(result)).size, result.length);
  }

  // 8. Keyword-only product tetap muncul.
  // 9. Semantic-only product tetap muncul.
  {
    const result = await createService(
      [product({ id: 'keyword-only', name: 'Running Shoes', keywordScore: 0.9 })],
      [product({ id: 'semantic-only', name: 'Trail Shoes', similarity: 0.9 })],
    ).search({ query: 'running shoes' });
    assert.deepEqual(new Set(ids(result)), new Set(['keyword-only', 'semantic-only']));
  }

  // 10. Exact query "iPhone 15" mendapat keyword score tertinggi.
  {
    const result = await createService(
      [
        product({ id: 'exact', name: 'iPhone 15', keywordScore: 1 }),
        product({ id: 'prefix', name: 'iPhone 15 Pro', keywordScore: 0.8 }),
      ],
      [],
    ).search({ query: 'iPhone 15' });
    assert.deepEqual(ids(result), ['exact', 'prefix']);
    assert.equal(result[0]?.keywordScore, 1);
  }

  // 11. Keyword query "sepatu running".
  {
    const result = await createService([
      product({ id: 'running', name: 'Sepatu Running', keywordScore: 1 }),
    ], []).search({ query: 'sepatu running' });
    assert.equal(result[0]?.name, 'Sepatu Running');
    assert.equal(result[0]?.keywordScore, 1);
  }

  // 12. Semantic query "sepatu untuk lari jarak jauh".
  {
    const result = await createService([], [
      product({ id: 'long-run', name: 'Sepatu Marathon', similarity: 0.93 }),
    ]).search({ query: 'sepatu untuk lari jarak jauh' });
    assert.equal(result[0]?.name, 'Sepatu Marathon');
    assert.equal(result[0]?.semanticScore, 0.93);
  }

  // 13. Natural-language query "laptop murah untuk programming".
  {
    const result = await createService([], [
      product({ id: 'programming', name: 'Laptop Budget Developer', similarity: 0.91 }),
    ]).search({ query: 'laptop murah untuk programming' });
    assert.equal(result[0]?.id, 'programming');
    assert.equal(result[0]?.semanticScore, 0.91);
  }

  // 14. Ranking hybridScore benar.
  {
    const result = await createService(
      [product({ id: 'keyword-high', name: 'Keyword High', keywordScore: 0.9 })],
      [product({ id: 'semantic-high', name: 'Semantic High', similarity: 0.8 })],
      config(0.6, 0.4),
    ).search({ query: 'ranking' });
    assertHybridScore(result[0]!, 0.6, 0.4);
    assertHybridScore(result[1]!, 0.6, 0.4);
    assert.deepEqual(ids(result), ['keyword-high', 'semantic-high']);
    assert.equal(result[0]?.hybridScore, 0.54);
    assert.equal(result[1]?.hybridScore, 0.32);
  }

  // 15. Keyword weight memengaruhi hasil.
  {
    const keywordHeavy = await createService(
      [product({ id: 'keyword', name: 'Keyword', keywordScore: 1 })],
      [product({ id: 'semantic', name: 'Semantic', similarity: 0.9 })],
      config(0.8, 0.2),
    ).search({ query: 'weight' });
    assert.deepEqual(ids(keywordHeavy), ['keyword', 'semantic']);

    const semanticHeavy = await createService(
      [product({ id: 'keyword', name: 'Keyword', keywordScore: 1 })],
      [product({ id: 'semantic', name: 'Semantic', similarity: 0.9 })],
      config(0.2, 0.8),
    ).search({ query: 'weight' });
    assert.deepEqual(ids(semanticHeavy), ['semantic', 'keyword']);
  }

  // 16. Semantic weight memengaruhi hasil.
  {
    const result = await createService(
      [product({ id: 'keyword', name: 'Keyword', keywordScore: 0.7 })],
      [product({ id: 'semantic', name: 'Semantic', similarity: 0.95 })],
      config(0.3, 0.7),
    ).search({ query: 'semantic weight' });
    assert.deepEqual(ids(result), ['semantic', 'keyword']);
    assert.equal(result[0]?.hybridScore, 0.665);
  }

  // 17. minPrice dan maxPrice tervalidasi.
  await assert.rejects(
    () => createService([], []).search({ query: 'laptop', minPrice: 200, maxPrice: 100 }),
    /minPrice must be less than or equal to maxPrice/,
  );

  // 18. Limit hasil akhir diterapkan setelah merge + ranking.
  {
    const result = await createService(
      [
        product({ id: 'a', name: 'A', keywordScore: 0.5 }),
        product({ id: 'b', name: 'B', keywordScore: 0.9 }),
      ],
      [
        product({ id: 'c', name: 'C', similarity: 0.8 }),
        product({ id: 'd', name: 'D', similarity: 0.7 }),
      ],
    ).search({ query: 'limit', limit: 2 });
    assert.deepEqual(ids(result), ['b', 'c']);
    assert.equal(result.length, 2);
  }

  // 19. Hasil sorting deterministik.
  {
    const service = createService(
      [
        product({ id: 'b', name: 'Same', keywordScore: 0.5 }),
        product({ id: 'a', name: 'Same', keywordScore: 0.5 }),
      ],
      [],
    );
    const first = await service.search({ query: 'deterministic' });
    const second = await service.search({ query: 'deterministic' });
    assert.deepEqual(ids(first), ['a', 'b']);
    assert.deepEqual(ids(second), ['a', 'b']);
  }

  // 20. Produk dengan id tidak valid ditangani dengan aman.
  {
    const result = await createService(
      [product({ id: '', name: 'Invalid Keyword', keywordScore: 1 })],
      [
        product({ id: 'valid', name: 'Valid Semantic', similarity: 0.8 }),
        product({ id: '   ', name: 'Invalid Semantic', similarity: 1 }),
      ],
    ).search({ query: 'invalid id' });
    assert.deepEqual(ids(result), ['valid']);
    assert.ok(result.every((item) => item.id.trim().length > 0));
  }

  console.log('Hybrid search service tests passed (20 scenarios).');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
