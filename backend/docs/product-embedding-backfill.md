# Product Embedding Backfill

Product embeddings use the same Gemini model configured by `embeddingConfig` (`gemini-embedding-001`, 1536 dimensions) as future semantic-search query embeddings.

## Prerequisites

Set these backend environment variables:

```env
DATABASE_URL=...
GEMINI_API_KEY=...
```

The Gemini key must remain backend-only.

## Run

From the `backend` directory:

```bash
pnpm install
pnpm backfill:product-embeddings
```

The command is a backend script, not a public HTTP endpoint.

## Behavior

- Reads products in batches of 10.
- Processes products sequentially inside each batch to avoid sending a burst of Gemini requests.
- Skips products that already have an embedding for the configured model.
- Uses the existing `ProductEmbeddingService` and Gemini embedding provider.
- Retries failed embedding operations with exponential delays (1s, 2s, 4s).
- A failed product is recorded and does not stop the remaining products.
- Re-running the command is safe: the `(product_id, model)` unique constraint prevents duplicate rows and existing embeddings are skipped.
- A final summary reports processed, generated, skipped, and failed products.

If products fail because of Gemini rate limits or a temporary provider problem, resolve the provider issue and run the same command again. Previously successful embeddings are skipped.

## Product lifecycle

New products generate an embedding after the product row is committed. If Gemini fails, product creation remains successful and the product can be recovered by running the backfill.

Product updates regenerate embeddings only when the canonical semantic fields change (`name`, `description`, `categoryId`, or `unit`). Non-semantic changes such as price, stock, images, discount, rating, or active state do not trigger regeneration.

Product deletion relies on the PostgreSQL foreign-key `ON DELETE CASCADE` from `product_embeddings.product_id` to `products.id`.

## Current schema limitation

The current `products` table does not contain `brand` or a generic product-attributes column. Those fields are therefore not included in the embedding representation. If they are added to the product schema later, the canonical embedding text and semantic-change detection should be updated together, followed by a backfill.
