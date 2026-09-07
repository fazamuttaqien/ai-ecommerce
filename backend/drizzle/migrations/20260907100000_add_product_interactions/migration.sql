CREATE TYPE "public"."product_interaction_type" AS ENUM('view', 'homepage_click');
--> statement-breakpoint
CREATE TABLE "product_interactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "type" "product_interaction_type" NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_interactions" ADD CONSTRAINT "product_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "product_interactions" ADD CONSTRAINT "product_interactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;
--> statement-breakpoint
CREATE INDEX "product_interactions_user_created_idx" ON "product_interactions" USING btree ("user_id", "created_at");
--> statement-breakpoint
CREATE INDEX "product_interactions_user_product_type_idx" ON "product_interactions" USING btree ("user_id", "product_id", "type");
