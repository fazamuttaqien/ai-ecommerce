CREATE EXTENSION IF NOT EXISTS vector;

--> statement-breakpoint
CREATE TABLE "product_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid (),
	"product_id" uuid NOT NULL,
	"embedding" vector (1536) NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp DEFAULT now () NOT NULL,
	"updated_at" timestamp DEFAULT now () NOT NULL,
	CONSTRAINT "product_embeddings_product_model_unique" UNIQUE ("product_id", "model")
);

--> statement-breakpoint
CREATE INDEX "product_embeddings_product_id_idx" ON "product_embeddings" ("product_id");

--> statement-breakpoint
CREATE INDEX "product_embeddings_embedding_cosine_idx" ON "product_embeddings" USING hnsw ("embedding" vector_cosine_ops);

--> statement-breakpoint
ALTER TABLE "product_embeddings" ADD CONSTRAINT "product_embeddings_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE;