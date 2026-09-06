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

## Canonical product representation

The embedding text is built from the product's semantic fields:

- product name
- brand
- description
- category
- unit

Therefore product brand data must be populated before running the backfill.

## Product lifecycle

New products generate an embedding after the product row is committed. If Gemini fails, product creation remains successful and the product can be recovered by running the backfill.

Product updates regenerate embeddings when the canonical semantic fields change (`name`, `description`, `brand`, `categoryId`, or `unit`). Non-semantic changes such as price, stock, images, discount, rating, or active state do not trigger regeneration.

Product deletion relies on the PostgreSQL foreign-key `ON DELETE CASCADE` from `product_embeddings.product_id` to `products.id`.

## Seed order

The product seed now stores brand together with each product, so a separate `product-brand.seed.ts` script is no longer required.

For a fresh local database:

```text
pnpm seed:categories
pnpm seed:products
pnpm backfill:product-embeddings
```

If no admin user exists yet, `product.seed.ts` creates one using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from the backend environment.
