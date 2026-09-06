import assert from 'node:assert/strict';

import {
  executeSemanticSearchProducts,
  type SemanticSearchToolDependencies,
} from '../../tools/ai/semantic-search.tools';

const searchResult = {
  items: [
    {
      id: 'product-1',
      name: 'Trail Running Shoes',
      brand: 'RunPro',
      slug: 'trail-running-shoes',
      description: 'Lightweight shoes for long-distance running',
      images: ['shoe.jpg'],
      originalPrice: 120,
      salePrice: 100,
      discountPercent: 17,
      unit: 'pair',
      stockCount: 8,
      ratingAverage: 4.7,
      reviewCount: 12,
      category: { id: 'cat-1', name: 'Shoes' },
      similarity: 0.91,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 10,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const baseDependencies = (): SemanticSearchToolDependencies => ({
  search: async () => searchResult,
});

async function testSemanticQueryAndFilters(): Promise<void> {
  const dependencies = baseDependencies();
  let received:
    Parameters<SemanticSearchToolDependencies['search']>[0] | undefined;
  dependencies.search = async (input) => {
    received = input;
    return searchResult;
  };

  const result = await executeSemanticSearchProducts(
    {
      query: 'laptop for a programmer with a limited budget',
      categoryId: 'laptops',
      brand: 'TechBrand',
      minPrice: 500,
      maxPrice: 1000,
      limit: 5,
    },
    dependencies,
  );

  assert.equal(
    received?.query,
    'laptop for a programmer with a limited budget',
  );
  assert.equal(received?.categoryId, 'laptops');
  assert.equal(received?.brand, 'TechBrand');
  assert.equal(received?.minPrice, 500);
  assert.equal(received?.maxPrice, 1000);
  assert.equal(received?.page, 1);
  assert.equal(received?.pageSize, 5);
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].similarity, 0.91);
  assert.equal('embedding' in result.products[0], false);
}

async function testNaturalLanguageIntent(): Promise<void> {
  const dependencies = baseDependencies();
  let receivedQuery = '';
  dependencies.search = async (input) => {
    receivedQuery = input.query;
    return searchResult;
  };

  await executeSemanticSearchProducts(
    { query: 'baju yang cocok untuk cuaca panas', limit: 3 },
    dependencies,
  );

  assert.equal(receivedQuery, 'baju yang cocok untuk cuaca panas');
}

async function testValidation(): Promise<void> {
  await assert.rejects(() =>
    executeSemanticSearchProducts({ query: '', limit: 10 }, baseDependencies()),
  );
  await assert.rejects(() =>
    executeSemanticSearchProducts(
      { query: 'phone', minPrice: 100, maxPrice: 50 },
      baseDependencies(),
    ),
  );
  await assert.rejects(() =>
    executeSemanticSearchProducts(
      { query: 'phone', limit: 21 },
      baseDependencies(),
    ),
  );
}

async function testSearchFailureIsControlled(): Promise<void> {
  const dependencies = baseDependencies();
  dependencies.search = async () => {
    throw new Error('database failure');
  };

  await assert.rejects(
    () =>
      executeSemanticSearchProducts(
        { query: 'smartphone for photography' },
        dependencies,
      ),
    /Semantic product search failed/,
  );
}

async function main(): Promise<void> {
  const tests = [
    testSemanticQueryAndFilters,
    testNaturalLanguageIntent,
    testValidation,
    testSearchFailureIsControlled,
  ];
  let failures = 0;
  for (const test of tests) {
    try {
      await test();
    } catch (error) {
      failures++;
      process.stderr.write(`${test.name}: ${(error as Error).message}\n`);
    }
  }
  if (failures > 0) process.exit(1);
  process.stdout.write(`${tests.length} semantic search tool tests passed.\n`);
}

main();
