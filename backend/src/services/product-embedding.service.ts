import { and, eq } from 'drizzle-orm';

import { embeddingConfig } from '../config/embedding.config';
import { db } from '../db';
import { categories, products, productEmbeddings } from '../db/schema';
import { embeddingService } from './embedding.service';
import { buildProductEmbeddingText } from './product-embedding-text.service';

export type ProductEmbeddingResult = {
  productId: string;
  model: string;
  embedding: number[];
};

export class ProductEmbeddingService {
  async exists(productId: string): Promise<boolean> {
    const [row] = await db
      .select({ id: productEmbeddings._id })
      .from(productEmbeddings)
      .where(
        and(
          eq(productEmbeddings.productId, productId),
          eq(productEmbeddings.model, embeddingConfig.model),
        ),
      )
      .limit(1);

    return Boolean(row);
  }

  async generate(productId: string): Promise<ProductEmbeddingResult | null> {
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
      console.error(
        `Product embedding skipped: product not found [${productId}]`,
      );
      return null;
    }

    const text = buildProductEmbeddingText(product.product, product.category);
    const embedding = await embeddingService.embedDocument(text);

    // Product persistence is independent from embedding persistence. A Gemini
    // failure must never make a successful product create/update fail.
    if (!embedding) return null;

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
      console.error(
        `Product embedding persistence failed for product [${productId}]`,
        error,
      );
      return null;
    }
  }

  async delete(productId: string): Promise<void> {
    await db
      .delete(productEmbeddings)
      .where(eq(productEmbeddings.productId, productId));
  }
}

export const productEmbeddingService = new ProductEmbeddingService();
