ALTER TABLE "expenses" ADD COLUMN "kdvRate" numeric(5, 2) DEFAULT '20.00';--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "kdvAmount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "netAmount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "invoiceNumber" varchar(100);--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "invoiceDate" timestamp;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "supplier" varchar(255);--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "isKdvDeductible" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "parasutExpenseId" varchar(100);--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "kdvRate" numeric(5, 2) DEFAULT '20.00';--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "kdvAmount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "unitPrice" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "kdvRate" numeric(5, 2) DEFAULT '20.00';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "kdvAmount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "subtotal" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippingCost" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discountAmount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "currency" varchar(3) DEFAULT 'TRY';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paymentMethod" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paymentStatus" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paidAt" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoiceNumber" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoiceStatus" varchar(20) DEFAULT 'not_issued';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoiceIssuedAt" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "parasutInvoiceId" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billingName" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billingAddress" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billingCity" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billingCountry" varchar(100) DEFAULT 'TR';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "taxNumber" varchar(20);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "kdvRate" numeric(5, 2) DEFAULT '20.00';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "currency" varchar(3) DEFAULT 'TRY';--> statement-breakpoint
ALTER TABLE "returns" ADD COLUMN "kdvRefundAmount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "returns" ADD COLUMN "parasutCreditNoteId" varchar(100);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "taxNumber" varchar(20);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "taxOffice" varchar(100);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "companyType" varchar(50);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "mersis" varchar(20);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "parasutClientId" varchar(255);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "parasutClientSecret" varchar(500);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "parasutCompanyId" varchar(100);--> statement-breakpoint
ALTER TABLE "storeSettings" ADD COLUMN "parasutEnabled" boolean DEFAULT false;--> statement-breakpoint
-- Mevcut teslim siparişleri gelir istatistiklerinde görünsün (ödeme alındı varsayımı)
UPDATE "orders" SET "paymentStatus" = 'paid' WHERE "status" = 'delivered' AND "paymentStatus" = 'pending';