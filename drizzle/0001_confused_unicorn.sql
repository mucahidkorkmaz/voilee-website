CREATE TABLE "returnItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"returnId" integer NOT NULL,
	"productId" integer,
	"productName" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2),
	"imageUrl" varchar(500)
);
--> statement-breakpoint
ALTER TABLE "returns" ADD COLUMN "returnNumber" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "returns_returnNumber_unique" UNIQUE("returnNumber");