ALTER TABLE "heroSlides" ADD COLUMN "ctaLabelTR" varchar(255) DEFAULT 'Koleksiyonu Keşfet' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "ctaLabelEN" varchar(255) DEFAULT 'Explore Collection' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "ctaLabelAR" varchar(255) DEFAULT 'استكشف المجموعة' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "ctaVisible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "secLabelTR" varchar(255) DEFAULT 'Hikayemiz' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "secLabelEN" varchar(255) DEFAULT 'Our Story' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "secLabelAR" varchar(255) DEFAULT 'Our Story' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "secHrefTR" varchar(500) DEFAULT '/hakkimizda' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "secHrefEN" varchar(500) DEFAULT '/en/about' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "secHrefAR" varchar(500) DEFAULT '/ar/about' NOT NULL;--> statement-breakpoint
ALTER TABLE "heroSlides" ADD COLUMN "secVisible" boolean DEFAULT true NOT NULL;