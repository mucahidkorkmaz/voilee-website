CREATE TYPE "public"."expense_category" AS ENUM('shipping', 'advertising', 'material', 'salary', 'rent', 'tax', 'commission', 'packaging', 'software', 'other');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unowned', 'registered', 'transferring');--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "expense_category" NOT NULL,
	"description" varchar(500) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"isRecurring" boolean DEFAULT false,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productVerifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"serialNumber" varchar(50) NOT NULL,
	"productId" integer,
	"productNameTR" varchar(255),
	"productNameEN" varchar(255),
	"productNameAR" varchar(255),
	"collection" varchar(100),
	"collectionYear" varchar(20),
	"batchNumber" varchar(100),
	"productionDate" varchar(100),
	"material" varchar(255),
	"imageUrl" varchar(500),
	"orderNumber" varchar(50),
	"orderItemId" integer,
	"status" "verification_status" DEFAULT 'unowned' NOT NULL,
	"ownerUserId" integer,
	"ownerName" varchar(255),
	"ownerEmail" varchar(320),
	"registeredAt" timestamp,
	"transferToName" varchar(255),
	"transferToEmail" varchar(320),
	"transferNote" text,
	"transferInitiatedAt" timestamp,
	"scanCount" integer DEFAULT 0 NOT NULL,
	"firstScannedAt" timestamp,
	"lastScannedAt" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "productVerifications_serialNumber_unique" UNIQUE("serialNumber")
);
--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "smtpHost" varchar(255);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "smtpPort" varchar(10);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "smtpSecure" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "smtpUser" varchar(320);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "smtpPass" varchar(500);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "smtpFrom" varchar(320);