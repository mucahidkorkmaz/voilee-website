CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."return_status" AS ENUM('requested', 'accepted', 'rejected', 'processed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."webhook_event" AS ENUM('order.created', 'order.updated', 'order.shipped', 'order.delivered', 'order.cancelled', 'product.created', 'product.updated', 'product.deleted', 'user.registered');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"nameTR" varchar(255) NOT NULL,
	"nameEN" varchar(255) NOT NULL,
	"nameAR" varchar(255) NOT NULL,
	"silhouetteId" integer,
	"imageUrl" varchar(500),
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cmsPages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"titleTR" varchar(255) NOT NULL,
	"titleEN" varchar(255) NOT NULL,
	"titleAR" varchar(255) NOT NULL,
	"contentTR" text,
	"contentEN" text,
	"contentAR" text,
	"isPublished" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cmsPages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"nameTR" varchar(255) NOT NULL,
	"nameEN" varchar(255) NOT NULL,
	"nameAR" varchar(255) NOT NULL,
	"descriptionTR" text,
	"descriptionEN" text,
	"descriptionAR" text,
	"imageUrl" varchar(500),
	"isActive" boolean DEFAULT true,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"type" "discount_type" DEFAULT 'percentage' NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"minOrderAmount" numeric(10, 2),
	"maxUses" integer,
	"usedCount" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "emailTemplates" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"subject" varchar(500),
	"body" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "emailTemplates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "mediaItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(1000) NOT NULL,
	"filename" varchar(255),
	"mimeType" varchar(100),
	"sizeBytes" integer,
	"alt" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletterSubscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"language" varchar(10) DEFAULT 'TR',
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletterSubscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"totalPrice" numeric(12, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending',
	"shippingAddress" text,
	"shippingCountry" varchar(100),
	"trackingNumber" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"nameTR" varchar(255) NOT NULL,
	"nameEN" varchar(255) NOT NULL,
	"nameAR" varchar(255) NOT NULL,
	"descriptionTR" text,
	"descriptionEN" text,
	"descriptionAR" text,
	"price" numeric(10, 2) NOT NULL,
	"collection" varchar(100),
	"silhouetteId" integer,
	"categoryId" integer,
	"imageUrl" varchar(500),
	"stock" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"userId" integer,
	"customerEmail" varchar(320),
	"customerName" varchar(255),
	"reason" varchar(100) NOT NULL,
	"notes" text,
	"status" "return_status" DEFAULT 'requested' NOT NULL,
	"adminNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "silhouettes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"nameTR" varchar(255) NOT NULL,
	"nameEN" varchar(255) NOT NULL,
	"nameAR" varchar(255) NOT NULL,
	"imageUrl" varchar(500),
	"sortOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "silhouettes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "storeSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"storeName" varchar(255) DEFAULT 'VOILÉE',
	"storeEmail" varchar(320),
	"storePhone" varchar(32),
	"storeAddress" text,
	"faviconUrl" varchar(500),
	"instagramUrl" varchar(500),
	"facebookUrl" varchar(500),
	"twitterUrl" varchar(500),
	"youtubeUrl" varchar(500),
	"tiktokUrl" varchar(500),
	"pinterestUrl" varchar(500),
	"linkedinUrl" varchar(500),
	"snapchatUrl" varchar(500),
	"whatsappUrl" varchar(500),
	"telegramUrl" varchar(500),
	"freeShippingThreshold" numeric(10, 2) DEFAULT '500',
	"shippingCostDomestic" numeric(10, 2) DEFAULT '49.99',
	"shippingCostInternational" numeric(10, 2) DEFAULT '199.99',
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(320) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(32),
	"passwordHash" varchar(255),
	"emailVerified" boolean DEFAULT false NOT NULL,
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"event" "webhook_event" NOT NULL,
	"secret" varchar(255),
	"isActive" boolean DEFAULT true,
	"lastTriggeredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
