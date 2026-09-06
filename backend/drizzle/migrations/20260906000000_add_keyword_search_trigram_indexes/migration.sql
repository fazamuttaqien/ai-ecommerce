CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

CREATE INDEX "products_name_trgm_idx" ON "products" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_brand_trgm_idx" ON "products" USING gin ("brand" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_description_trgm_idx" ON "products" USING gin ("description" gin_trgm_ops);
