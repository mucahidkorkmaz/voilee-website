import { describe, expect, it } from "vitest";
import {
  KDV_RATE_DEFAULT,
  ayrıstırKdv,
  hesaplaGelirVergisi,
  hesaplaMaliOzet,
  hesaplaToplamFiyat,
  kdvEkle,
} from "./finance";

describe("ayrıstırKdv", () => {
  it("varsayılan %20 ile 1200 → 1000 + 200", () => {
    const { kdvHaric, kdv } = ayrıstırKdv(1200);
    expect(kdvHaric).toBeCloseTo(1000, 5);
    expect(kdv).toBeCloseTo(200, 5);
  });

  it("%10 ile 1100 → 1000 + 100", () => {
    const { kdvHaric, kdv } = ayrıstırKdv(1100, 10);
    expect(kdvHaric).toBeCloseTo(1000, 5);
    expect(kdv).toBeCloseTo(100, 5);
  });

  it("sıfır tutar", () => {
    expect(ayrıstırKdv(0, 20)).toEqual({ kdvHaric: 0, kdv: 0 });
  });
});

describe("kdvEkle", () => {
  it("1000 + %20 → 1200", () => {
    expect(kdvEkle(1000)).toBeCloseTo(1200, 5);
  });
});

describe("hesaplaToplamFiyat", () => {
  it("boş kalem listesi", () => {
    expect(hesaplaToplamFiyat([])).toEqual({
      toplamKdvDahil: 0,
      toplamKdvHaric: 0,
      toplamKdv: 0,
    });
  });

  it("tek kalem KDV dahil fiyat × miktar", () => {
    const r = hesaplaToplamFiyat([{ fiyat: 120, miktar: 2 }]);
    expect(r.toplamKdvDahil).toBe(240);
    expect(r.toplamKdvHaric).toBeCloseTo(200, 5);
    expect(r.toplamKdv).toBeCloseTo(40, 5);
  });

  it("farklı kdv oranları", () => {
    const r = hesaplaToplamFiyat([
      { fiyat: 110, miktar: 1, kdvOrani: 10 },
      { fiyat: 120, miktar: 1, kdvOrani: 20 },
    ]);
    expect(r.toplamKdvDahil).toBe(230);
    expect(r.toplamKdvHaric).toBeCloseTo(200, 5);
    expect(r.toplamKdv).toBeCloseTo(30, 5);
  });
});

describe("hesaplaGelirVergisi", () => {
  it("sıfır veya negatif matrah → 0", () => {
    expect(hesaplaGelirVergisi(0)).toBe(0);
    expect(hesaplaGelirVergisi(-1000)).toBe(0);
  });

  it("ilk dilim içi (50.000 × %15)", () => {
    expect(hesaplaGelirVergisi(50_000)).toBeCloseTo(7500, 2);
  });

  it("iki dilim (150.000)", () => {
    expect(hesaplaGelirVergisi(150_000)).toBeCloseTo(24_500, 2);
  });

  it("yüksek matrah (1.000.000)", () => {
    expect(hesaplaGelirVergisi(1_000_000)).toBeCloseTo(282_000, 2);
  });
});

describe("hesaplaMaliOzet", () => {
  it("gelir, iade ve gider ile net ve KDV", () => {
    const o = hesaplaMaliOzet({
      toplamGelirKdvDahil: 1200,
      toplamIadeKdvDahil: 0,
      toplamGiderIndirilebilir: 600,
      toplamGiderIndirilemez: 0,
      kdvOrani: KDV_RATE_DEFAULT,
    });
    expect(o.kdvHaricGelir).toBeCloseTo(1000, 2);
    expect(o.tahsilKdv).toBeCloseTo(200, 2);
    expect(o.kdvHaricGider).toBeCloseTo(500, 2);
    expect(o.indirilecekKdv).toBeCloseTo(100, 2);
    expect(o.kdvHaricNetGelir).toBeCloseTo(1000, 2);
    expect(o.gercekKar).toBeCloseTo(500, 2);
    expect(o.odenecekKdv).toBeCloseTo(100, 2);
  });

  it("indirilemez gider KDV hariç toplama eklenir, indirilecek KDV’ye dahil olmaz", () => {
    const o = hesaplaMaliOzet({
      toplamGelirKdvDahil: 1200,
      toplamIadeKdvDahil: 0,
      toplamGiderIndirilebilir: 0,
      toplamGiderIndirilemez: 600,
    });
    expect(o.indirilecekKdv).toBe(0);
    expect(o.kdvHaricGider).toBeCloseTo(500, 2);
    expect(o.gercekKar).toBeCloseTo(500, 2);
  });
});
