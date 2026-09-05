import { eq } from 'drizzle-orm';

import { db } from '../db';
import { categories, products, productEmbeddings } from '../db/schema';
import { EmbeddingProviderError } from '../embeddings/embedding.provider';
import { embeddingConfig } from '../config/embedding.config';
import { embeddingService } from './embedding.service';
import { buildProductEmbeddingText } from './product-embedding-text.service';

export type ProductEmbeddingResult = {
  productId: string;
  model: string;
  embedding: number[];
};

export const generateProductEmbedding = async (
  productId: string,
): Promise<ProductEmbeddingResult | null> => {
  const [product] = await db
    .select({
      product: products,
      category: {
        name: categories.name,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories._id))
    .where(eq(products._id, productId))
    .limit(1);

  if (!product) {
    console.error(`Product embedding skipped: product not found [${productId}]`);
    return null;
  }

  const text = buildProductEmbeddingText(product.product, product.category);
  const embedding = await embeddingService.embedDocument(text);

  if (!embedding) {
    return null;
  }

  try {
    await db
      .insert(productEmbeddings)
      .values({
        productId: product.product._id,
        embedding,
        model: embeddingConfig.model,
      })
      .onConflictDoUpdate({
        target: [productEmbeddings.productId, productEmbeddings.model],
        set: {
          embedding,
          updatedAt: new Date(),
        },
      });

    return {
      productId: product.product._id,
      model: embeddingConfig.model,
      embedding,
    };
  } catch (error) {
    if (error instanceof EmbeddingProviderError) {
      console.error(
        `Product embedding persistence failed [${error.code}] for product [${productId}]`,
      );
    } else {
      console.error(
        `Product embedding persistence failed for product [${productId}]`,
        error,
      );
    }

    return null;
  }
};
