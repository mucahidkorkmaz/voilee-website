CREATE TABLE IF NOT EXISTS "abandonedCarts" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"userId" integer,
	"customerEmail" varchar(320),
	"customerName" varchar(255),
	"itemsJson" text NOT NULL,
	"cartTotal" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'TRY' NOT NULL,
	"lastActivityAt" timestamp DEFAULT now() NOT NULL,
	"reminderEmailSentAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "abandonedCarts_sessionId_unique" UNIQUE("sessionId")
);
