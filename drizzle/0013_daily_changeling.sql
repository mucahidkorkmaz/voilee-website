CREATE TYPE "public"."combination_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "combinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"silhouetteId" integer NOT NULL,
	"slug" varchar(255) NOT NULL,
	"nameTR" varchar(255) NOT NULL,
	"nameEN" varchar(255) NOT NULL,
	"nameAR" varchar(255) NOT NULL,
	"descriptionTR" text,
	"descriptionEN" text,
	"descriptionAR" text,
	"price" numeric(10, 2) NOT NULL,
	"autoPrice" numeric(10, 2) NOT NULL,
	"priceOverridden" boolean DEFAULT false,
	"imageUrl" varchar(500),
	"galleryUrls" text,
	"status" "combination_status" DEFAULT 'draft' NOT NULL,
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "combinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "combinationItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"combinationId" integer NOT NULL,
	"productId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "combinationId" integer;
