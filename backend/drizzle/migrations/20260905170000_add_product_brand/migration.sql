ALTER TABLE "products" ADD COLUMN "brand" text NOT NULL DEFAULT 'Generic';--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" ("brand");
