CREATE TABLE "productVariants" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"nameTR" varchar(255) NOT NULL,
	"nameEN" varchar(255) NOT NULL,
	"nameAR" varchar(255) NOT NULL,
	"sku" varchar(100),
	"price" numeric(10, 2),
	"stock" integer DEFAULT 0 NOT NULL,
	"imageUrl" varchar(500),
	"colorHex" varchar(7),
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "combinationItems" ADD COLUMN "variantId" integer;