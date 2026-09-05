import type { Category, Product } from '../db/schema';

export type ProductEmbeddingData = Pick<
  Product,
  'name' | 'description'
> & {
  category?: Pick<Category, 'name'> | null;
};

/**
 * Builds the canonical semantic representation of a product.
 * Keep this format stable so indexing, re-indexing, and updates generate
 * embeddings from the same semantic content.
 */
export const buildProductEmbeddingText = (
  product: ProductEmbeddingData,
): string => {
  const sections = [`Product: ${product.name}`];

  if (product.description?.trim()) {
    sections.push(`Description: ${product.description.trim()}`);
  }

  if (product.category?.name?.trim()) {
    sections.push(`Category: ${product.category.name.trim()}`);
  }

  return sections.join('\n');
};
