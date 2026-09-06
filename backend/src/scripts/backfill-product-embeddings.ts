import 'dotenv/config';

import { and, desc, eq, isNull } from 'drizzle-orm';

import { embeddingConfig } from '../config/embedding.config';
import { db, disconnectDatabase, products, productEmbeddings } from '../db';
import { productEmbeddingService } from '../services/product-embedding.service';

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryDelay = (attempt: number) =>
  INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1);

const generateWithRetry = async (productId: string): Promise<boolean> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const result = await productEmbeddingService.generate(productId);
    if (result) return true;

    if (attempt < MAX_RETRIES) {
      const delay = retryDelay(attempt);
      console.warn(
        `Embedding failed for ${productId}; retrying in ${delay}ms (${attempt}/${MAX_RETRIES - 1})`,
      );
      await sleep(delay);
    }
  }

  return false;
};

const run = async () => {
  let offset = 0;
  let processed = 0;
  let generated = 0;
  let failed = 0;

  console.log(
    `Starting product embedding backfill: model=${embeddingConfig.model}, batchSize=${BATCH_SIZE}`,
  );

  while (true) {
    // Only select products that do not have an embedding for the current model.
    // The database constraint still guarantees one embedding per product/model.
    const batch = await db
      .select({ id: products._id })
      .from(products)
      .leftJoin(
        productEmbeddings,
        and(
          eq(productEmbeddings.productId, products._id),
          eq(productEmbeddings.model, embeddingConfig.model),
        ),
      )
      .where(isNull(productEmbeddings._id))
      .orderBy(desc(products.createdAt))
      .offset(offset)
      .limit(BATCH_SIZE);

    if (batch.length === 0) break;

    for (const product of batch) {
      processed += 1;

      const success = await generateWithRetry(product.id);
      if (success) {
        generated += 1;
      } else {
        failed += 1;
        console.error(`Product embedding permanently failed [${product.id}]`);
      }
    }

    offset += batch.length;
    console.log(
      `Backfill progress: processed=${processed}, generated=${generated}, failed=${failed}`,
    );
  }

  console.log(
    `Product embedding backfill completed: processed=${processed}, generated=${generated}, failed=${failed}`,
  );

  if (failed > 0) {
    console.warn(
      'Some products failed. Re-run the same command after resolving the Gemini/API issue; existing embeddings will not be regenerated.',
    );
  }
};

run()
  .catch((error) => {
    console.error('Product embedding backfill failed unexpectedly', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
