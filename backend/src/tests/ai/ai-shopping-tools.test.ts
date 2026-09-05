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

const product = {
  _id: 'product-1', name: 'Test Phone', slug: 'test-phone', images: ['image.jpg'],
  description: 'A test product' as string | null, originalPrice: 100, salePrice: 80,
  discountPercent: 20, discountLabel: '20% OFF' as string | null, unit: 'pc', stockCount: 5,
  ratingAverage: 4.5, reviewCount: 10, categoryId: 'category-1',
  category: { _id: 'category-1', name: 'Phones', slug: 'phones' } as { _id: string; name: string; slug: string } | null,
  createdAt: new Date('2026-01-01'),
};

const productsResult = (): ProductsResult => ({
  products: [product],
  pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
});

const productResult = (): ProductResult => ({ product, relatedProducts: [] });

const reviewsResult = (): ReviewsResult => ({
  reviews: [{
    _id: 'review-1', rating: 5, comment: 'Great' as string | null,
    createdAt: new Date('2026-01-01'), user: { name: 'Buyer', avatar: 'avatar.jpg' } as { name: string; avatar: string | null } | null,
  }],
  ratingBreakdown: [{ rating: 5, count: 1 }],
  pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
});

const baseDependencies = (): Dependencies => ({
  getProducts: async () => productsResult(),
  getProductBySlug: async () => productResult(),
  getProductReviews: async () => reviewsResult(),
});

async function captureProductQuery(
  input: Parameters<Dependencies['getProducts']>[0],
): Promise<GetProductsInput> {
  return input;
