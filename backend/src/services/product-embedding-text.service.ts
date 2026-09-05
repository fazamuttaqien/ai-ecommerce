import type { Category, Product } from '../db/schema';

export type ProductEmbeddingData = Pick<
  Product,
  'name' | 'brand' | 'description' | 'unit'
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

  if (product.brand?.trim()) {
    sections.push(`Brand: ${product.brand.trim()}`);
  }

  if (product.description?.trim()) {
    sections.push(`Description: ${product.description.trim()}`);
  }

  if (product.category?.name?.trim()) {
    sections.push(`Category: ${product.category.name.trim()}`);
  }

  if (product.unit?.trim()) {
    sections.push(`Unit: ${product.unit.trim()}`);
  }

  return sections.join('\n');
};
