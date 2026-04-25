/**
 * Seed: Lookbook collections
 *
 * 6 koleksiyon: Origine — Mouvement — Épure — Noir — Héritage — Atelier
 * Sıralama: kullanıcının istediği düzende (sortOrder 0..5).
 *
 * Idempotent — slug üzerinden upsert. Tekrar çalıştırılabilir, duplicate atmaz.
 *
 * Çalıştırma:
 *   pnpm tsx scripts/seed-collections.ts
 *
 * Gereksinim: .env içinde DATABASE_URL set olmalı.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { collections } from "../drizzle/schema";

const CDN =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS";

type Row = {
  slug: string;
  nameTR: string;
  nameEN: string;
  nameAR: string;
  descriptionTR: string;
  descriptionEN: string;
  descriptionAR: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

const rows: Row[] = [
  {
    slug: "origine",
    nameTR: "ORIGINE",
    nameEN: "ORIGINE",
    nameAR: "ORIGINE",
    descriptionTR: "Sade bir başlangıç.",
    descriptionEN: "A simple beginning.",
    descriptionAR: "بداية بسيطة.",
    imageUrl: `${CDN}/voilee_cdn_origine_57e73407.webp`,
    sortOrder: 0,
    isActive: true,
  },
  {
    slug: "mouvement",
    nameTR: "MOUVEMENT",
    nameEN: "MOUVEMENT",
    nameAR: "MOUVEMENT",
    descriptionTR: "Akışın içinde.",
    descriptionEN: "In the flow.",
    descriptionAR: "في التدفق.",
    imageUrl: `${CDN}/voilee_cdn_mouvement_7b7c4f3e.webp`,
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: "epure",
    nameTR: "ÉPURE",
    nameEN: "ÉPURE",
    nameAR: "ÉPURE",
    descriptionTR: "Netlik yeterlidir.",
    descriptionEN: "Clarity is enough.",
    descriptionAR: "الوضوح كافٍ.",
    imageUrl: `${CDN}/voilee_cdn_epure_2d5aaf15.webp`,
    sortOrder: 2,
    isActive: true,
  },
  {
    slug: "noir",
    nameTR: "NOIR",
    nameEN: "NOIR",
    nameAR: "NOIR",
    descriptionTR: "Sessiz bir varlık.",
    descriptionEN: "A silent presence.",
    descriptionAR: "حضور صامت.",
    imageUrl: `${CDN}/voilee_cdn_noir_68a8f8b6.webp`,
    sortOrder: 3,
    isActive: true,
  },
  {
    slug: "heritage",
    nameTR: "HÉRITAGE",
    nameEN: "HÉRITAGE",
    nameAR: "HÉRITAGE",
    descriptionTR: "Kalan anlar.",
    descriptionEN: "The moments that stay.",
    descriptionAR: "اللحظات الباقية.",
    imageUrl: `${CDN}/voilee_cdn_heritage_1a6b4b02.webp`,
    sortOrder: 4,
    isActive: true,
  },
  {
    slug: "atelier",
    nameTR: "ATELIER",
    nameEN: "ATELIER",
    nameAR: "ATELIER",
    descriptionTR: "Tek parça. Tek ifade.",
    descriptionEN: "One piece. One expression.",
    descriptionAR: "قطعة واحدة. تعبير واحد.",
    imageUrl: `${CDN}/voilee_cdn_atelier_d60dabd2.webp`,
    sortOrder: 5,
    isActive: true,
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[seed] DATABASE_URL boş. .env dosyasını kontrol edin.");
    process.exit(1);
  }

  const client = postgres(url);
  const db = drizzle(client);

  console.log(`[seed] ${rows.length} koleksiyon yazılıyor...`);

  for (const row of rows) {
    await db
      .insert(collections)
      .values(row)
      .onConflictDoUpdate({
        target: collections.slug,
        set: {
          nameTR: row.nameTR,
          nameEN: row.nameEN,
          nameAR: row.nameAR,
          descriptionTR: row.descriptionTR,
          descriptionEN: row.descriptionEN,
          descriptionAR: row.descriptionAR,
          imageUrl: row.imageUrl,
          sortOrder: row.sortOrder,
          isActive: row.isActive,
          updatedAt: new Date(),
        },
      });
    console.log(`[seed] ✓ ${row.slug} (sıra ${row.sortOrder})`);
  }

  await client.end();
  console.log("[seed] Tamamlandı.");
}

main().catch(err => {
  console.error("[seed] Hata:", err);
  process.exit(1);
});
