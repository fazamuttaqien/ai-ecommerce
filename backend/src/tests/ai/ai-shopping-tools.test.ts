import assert from 'node:assert/strict';

import {
  executeGetProduct,
  executeGetProductReviews,
  executeSearchProducts,
} from '../../tools/ai/product.tools';
import { NotFoundException } from '../../utils/app-error';
import type { GetProductsInput } from '../../validators/product.validator';

type Dependencies = NonNullable<Parameters<typeof executeSearchProducts>[1]>;
type ProductsResult = Awaited<ReturnType<Dependencies['getProducts']>>;
type ProductResult = Awaited<ReturnType<Dependencies['getProductBySlug']>>;
type ReviewsResult = Awaited<ReturnType<Dependencies['getProductReviews']>>;
type HybridResult = Awaited<ReturnType<Dependencies['hybridSearch']>>;

const product = {
  _id: 'product-1',
  name: 'Test Phone',
  slug: 'test-phone',
  images: ['image.jpg'],
  description: 'A test product' as string | null,
  originalPrice: 100,
  salePrice: 80,
  discountPercent: 20,
  discountLabel: '20% OFF' as string | null,
  unit: 'pc',
  stockCount: 5,
  ratingAverage: 4.5,
  reviewCount: 10,
  categoryId: 'category-1',
  category: { _id: 'category-1', name: 'Phones', slug: 'phones' } as {
    _id: string;
    name: string;
    slug: string;
  } | null,
  createdAt: new Date('2026-01-01'),
};

const hybridProduct = {
  id: 'product-1',
  name: 'Test Phone',
  brand: 'Test Brand',
  slug: 'test-phone',
  description: 'A test product',
  images: ['image.jpg'],
  originalPrice: 100,
  salePrice: 80,
  discountPercent: 20,
  discountLabel: '20% OFF',
  unit: 'pc',
  stockCount: 5,
  ratingAverage: 4.5,
  reviewCount: 10,
  category: { id: 'category-1', name: 'Phones', slug: 'phones' },
  similarity: 0.9,
  keywordScore: 1,
  semanticScore: 0.9,
  hybridScore: 0.95,
};

const productsResult = (): ProductsResult => ({
  products: [product],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
});

const productResult = (): ProductResult => ({ product, relatedProducts: [] });

const reviewsResult = (): ReviewsResult => ({
  reviews: [
    {
      _id: 'review-1',
      rating: 5,
      comment: 'Great' as string | null,
      createdAt: new Date('2026-01-01'),
      user: { name: 'Buyer', avatar: 'avatar.jpg' } as {
        name: string;
        avatar: string | null;
      } | null,
    },
  ],
  ratingBreakdown: [{ rating: 5, count: 1 }],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
});

const hybridResult = (): HybridResult => [hybridProduct];

const baseDependencies = (): Dependencies => ({
  getProducts: async () => productsResult(),
  getProductBySlug: async () => productResult(),
  getProductReviews: async () => reviewsResult(),
  hybridSearch: async () => hybridResult(),
});

async function captureProductQuery(
  input: Parameters<Dependencies['getProducts']>[0],
): Promise<GetProductsInput> {
  return input;
}

async function testKeywordSearchUsesHybrid(): Promise<void> {
  const dependencies = baseDependencies();
  let hybridCalled = false;
  let receivedQuery = '';
  dependencies.hybridSearch = async (query) => {
    hybridCalled = true;
    receivedQuery = query.query;
    return hybridResult();
  };

  const result = await executeSearchProducts({ keyword: 'phone' }, dependencies);

  assert.equal(hybridCalled, true);
  assert.equal(receivedQuery, 'phone');
  assert.equal(result.products[0].slug, 'test-phone');
  assert.equal(result.products[0].hybridScore, 0.95);
  assert.equal(result.products[0].semanticScore, 0.9);
  assert.equal(result.pagination.total, 1);
});

async function testCatalogFiltersKeepExistingService(): Promise<void> {
  const dependencies = baseDependencies();
  let hybridCalled = false;
  let received: GetProductsInput | undefined;
  dependencies.hybridSearch = async () => {
    hybridCalled = true;
    return hybridResult();
  };
  dependencies.getProducts = async (query) => {
    received = await captureProductQuery(query);
    return productsResult();
  };

  await executeSearchProducts(
    { keyword: 'phone', inStock: true, sort: 'highest-rating' },
    dependencies,
  );

  assert.equal(hybridCalled, false);
  assert.equal(received?.keyword, 'phone');
  assert.equal(received?.inStock, true);
  assert.equal(received?.sort, 'highest-rating');
}

async function testPriceFilter(): Promise<void> {
  const dependencies = baseDependencies();
  let received: GetProductsInput | undefined;
  dependencies.getProducts = async (query) => {
    received = await captureProductQuery(query);
    return productsResult();
  };
  await executeSearchProducts({ minPrice: 50, maxPrice: 100 }, dependencies);
  assert.equal(received?.minPrice, 50);
  assert.equal(received?.maxPrice, 100);
}

async function testStockFilter(): Promise<void> {
  const dependencies = baseDependencies();
  let received: GetProductsInput | undefined;
  dependencies.getProducts = async (query) => {
    received = await captureProductQuery(query);
    return productsResult();
  };
  await executeSearchProducts({ inStock: true }, dependencies);
  assert.equal(received?.inStock, true);
}

async function testDiscountFilter(): Promise<void> {
  const dependencies = baseDependencies();
  let received: GetProductsInput | undefined;
  dependencies.getProducts = async (query) => {
    received = await captureProductQuery(query);
    return productsResult();
  };
  await executeSearchProducts({ hasDiscount: true }, dependencies);
  assert.equal(received?.hasDiscount, true);
}

async function testSorting(): Promise<void> {
  const dependencies = baseDependencies();
  let received: GetProductsInput | undefined;
  dependencies.getProducts = async (query) => {
    received = await captureProductQuery(query);
    return productsResult();
  };
  await executeSearchProducts(
    { sort: 'highest-rating', limit: 5 },
    dependencies,
  );
  assert.equal(received?.sort, 'highest-rating');
  assert.equal(received?.limit, 5);
}

async function testProductDetail(): Promise<void> {
  const dependencies = baseDependencies();
  let slug = '';
  dependencies.getProductBySlug = async (query) => {
    slug = query.slug;
    return productResult();
  };
  const result = await executeGetProduct({ slug: 'test-phone' }, dependencies);
  assert.equal(slug, 'test-phone');
  assert.equal(result.product.slug, 'test-phone');
  assert.equal('userId' in result.product, false);
}

async function testReviews(): Promise<void> {
  const dependencies = baseDependencies();
  const result = await executeGetProductReviews(
    { slug: 'test-phone', page: 1, limit: 10 },
    dependencies,
  );
  assert.equal(result.reviews.length, 1);
  assert.equal(result.reviews[0].rating, 5);
  assert.equal(result.reviews[0].user?.name, 'Buyer');
}

async function testInvalidInput(): Promise<void> {
  const dependencies = baseDependencies();
  let called = false;
  dependencies.getProducts = async () => {
    called = true;
    return productsResult();
  };
  await assert.rejects(executeSearchProducts({ limit: 999 }, dependencies));
  assert.equal(called, false);
}

async function testNotFound(): Promise<void> {
  const dependencies = baseDependencies();
  dependencies.getProductBySlug = async () => {
    throw new NotFoundException('Product not found');
  };
  await assert.rejects(
    executeGetProduct({ slug: 'missing-product' }, dependencies),
    /Product detail lookup failed: Product not found/,
  );
}

async function main(): Promise<void> {
  const tests = [
    testKeywordSearchUsesHybrid,
    testCatalogFiltersKeepExistingService,
    testPriceFilter,
    testStockFilter,
    testDiscountFilter,
    testSorting,
    testProductDetail,
    testReviews,
    testInvalidInput,
    testNotFound,
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
  process.stdout.write(`${tests.length} AI shopping tool tests passed.\n`);
}
main();
