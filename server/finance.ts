/**
 * Mali hesaplama yardımcıları.
 * Tüm fonksiyonlar saf (pure) — side-effect yok, DB bağlantısı yok.
 * Test dosyası: server/finance.test.ts
 */

export const KDV_RATE_DEFAULT = 20; // Türkiye tekstil/giyim %20

// ─── KDV Ayrıştırma ───────────────────────────────────────────────────────────

/**
 * KDV dahil fiyattan KDV'yi ayıklar.
 * Örn: 1.200 TL → { kdvHaric: 1.000, kdv: 200 }
 */
export function ayrıstırKdv(
  kdvDahilTutar: number,
  kdvOrani: number = KDV_RATE_DEFAULT,
): { kdvHaric: number; kdv: number } {
  const kdvHaric = kdvDahilTutar / (1 + kdvOrani / 100);
  const kdv = kdvDahilTutar - kdvHaric;
  return { kdvHaric, kdv };
}

// ─── Gelir Hesabı ─────────────────────────────────────────────────────────────

export interface GelirGiderGirdisi {
  /** KDV dahil sipariş tutarları (sadece delivered+paid) */
  toplamGelirKdvDahil: number;
  /** KDV dahil iade tutarları (sadece processed) */
  toplamIadeKdvDahil: number;
  /** KDV dahil giderler (indirilebilir KDV'li) */
  toplamGiderIndirilebilir: number;
  /** KDV dahil giderler (KDV indirilemez — örn. kiralık araç) */
  toplamGiderIndirilemez: number;
  /** Ürün KDV oranı (varsayılan %20) */
  kdvOrani?: number;
}

export interface MaliOzet {
  // ── Gelir ──────────────────────────────────────────────────────────
  /** KDV hariç brüt gelir */
  kdvHaricGelir: number;
  /** KDV hariç iade tutarı */
  kdvHaricIade: number;
  /** KDV hariç net gelir (gelir - iade) */
  kdvHaricNetGelir: number;

  // ── Gider ──────────────────────────────────────────────────────────
  /** KDV hariç toplam gider (indirilebilir + indirilemez) */
  kdvHaricGider: number;

  // ── Kâr ────────────────────────────────────────────────────────────
  /** Gerçek kâr = KDV hariç net gelir − KDV hariç gider */
  gercekKar: number;

  // ── KDV ────────────────────────────────────────────────────────────
  /** Satışlardan tahsil edilen KDV */
  tahsilKdv: number;
  /** İade nedeniyle geri ödenen KDV */
  iadeKdv: number;
  /** Giderlerden indirilebilen KDV */
  indirilecekKdv: number;
  /** GİB'e ödenecek KDV = tahsil − iade − indirilecek */
  odenecekKdv: number;

  // ── Vergi Tahmini ──────────────────────────────────────────────────
  /** Yıllık vergi matrahı tahmini (aylık kâr × 12) */
  yillikMatrahTahmini: number;
  /** Yıllık gelir vergisi tahmini */
  yillikGelirVergisiTahmini: number;
}

export function hesaplaMaliOzet(girdi: GelirGiderGirdisi): MaliOzet {
  const oran = girdi.kdvOrani ?? KDV_RATE_DEFAULT;

  const { kdvHaric: kdvHaricGelir, kdv: tahsilKdv } = ayrıstırKdv(girdi.toplamGelirKdvDahil, oran);

  const { kdvHaric: kdvHaricIade, kdv: iadeKdv } = ayrıstırKdv(girdi.toplamIadeKdvDahil, oran);

  const { kdvHaric: giderHaric1, kdv: indirilecekKdv } = ayrıstırKdv(girdi.toplamGiderIndirilebilir, oran);

  const { kdvHaric: giderHaric2 } = ayrıstırKdv(girdi.toplamGiderIndirilemez, oran);

  const kdvHaricNetGelir = kdvHaricGelir - kdvHaricIade;
  const kdvHaricGider = giderHaric1 + giderHaric2;
  const gercekKar = kdvHaricNetGelir - kdvHaricGider;
  const odenecekKdv = tahsilKdv - iadeKdv - indirilecekKdv;

  // Yıllık tahmin: mevcut verinin 12 aylık izdüşümü
  const yillikMatrahTahmini = gercekKar * 12;
  const yillikGelirVergisiTahmini = hesaplaGelirVergisi(yillikMatrahTahmini);

  return {
    kdvHaricGelir,
    kdvHaricIade,
    kdvHaricNetGelir,
    kdvHaricGider,
    gercekKar,
    tahsilKdv,
    iadeKdv,
    indirilecekKdv,
    odenecekKdv,
    yillikMatrahTahmini,
    yillikGelirVergisiTahmini,
  };
}

// ─── Gelir Vergisi (2024 Türkiye Tarifesi) ───────────────────────────────────

/**
 * Türkiye 2024 yılı gelir vergisi tarifesi (şahıs işletmesi).
 * Kaynak: GVK Madde 103
 *
 * Dilimler:
 *   0       – 110.000 TL → %15
 *   110.001 – 230.000 TL → %20
 *   230.001 – 580.000 TL → %27
 *   580.001 – 3.000.000 TL → %35
 *   3.000.001+ TL        → %40
 *
 * NOT: Bu hesap tahminidir. Kesin beyan için mali müşavir danışılmalıdır.
 */
export function hesaplaGelirVergisi(yillikNetKar: number): number {
  if (yillikNetKar <= 0) return 0;

  const dilimler = [
    { tavan: 110_000, oran: 0.15 },
    { tavan: 230_000, oran: 0.2 },
    { tavan: 580_000, oran: 0.27 },
    { tavan: 3_000_000, oran: 0.35 },
    { tavan: Infinity, oran: 0.4 },
  ] as const;

  let vergi = 0;
  let kalan = yillikNetKar;
  let oncekiTavan = 0;

  for (const { tavan, oran } of dilimler) {
    if (kalan <= 0) break;
    const dilimdekiMatrah = Math.min(kalan, tavan - oncekiTavan);
    vergi += dilimdekiMatrah * oran;
    kalan -= dilimdekiMatrah;
    oncekiTavan = tavan;
  }

  return Math.round(vergi * 100) / 100;
}

// ─── Fiyat Yardımcıları ──────────────────────────────────────────────────────

/** KDV hariç fiyata KDV ekler. */
export function kdvEkle(kdvHaricFiyat: number, kdvOrani: number = KDV_RATE_DEFAULT): number {
  return kdvHaricFiyat * (1 + kdvOrani / 100);
}

/** Sipariş kalemlerinden toplam KDV dahil tutarı hesaplar. */
export function hesaplaToplamFiyat(
  kalemler: { fiyat: number; miktar: number; kdvOrani?: number }[],
): { toplamKdvDahil: number; toplamKdvHaric: number; toplamKdv: number } {
  let toplamKdvDahil = 0;
  let toplamKdvHaric = 0;
  let toplamKdv = 0;

  for (const kalem of kalemler) {
    const oran = kalem.kdvOrani ?? KDV_RATE_DEFAULT;
    const satirToplamKdvDahil = kalem.fiyat * kalem.miktar;
    const { kdvHaric, kdv } = ayrıstırKdv(satirToplamKdvDahil, oran);
    toplamKdvDahil += satirToplamKdvDahil;
    toplamKdvHaric += kdvHaric;
    toplamKdv += kdv;
  }

  return { toplamKdvDahil, toplamKdvHaric, toplamKdv };
}
