import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, type Collection } from "@/lib/api";

// ─── Per-koleksiyon içerik ────────────────────────────────────────────────────

const SEASON = "AW / 26";

type CollectionMeta = {
  tagTR: string;
  tagEN: string;
  bodyTR: string[];
  bodyEN: string[];
  fabricTR: string;
  fabricEN: string;
  paletteTR: string;
  paletteEN: string;
  productionTR: string;
  productionEN: string;
};

const meta: Record<string, CollectionMeta> = {
  origine: {
    tagTR: "Sade bir başlangıç.",
    tagEN: "A simple beginning.",
    bodyTR: ["Günün en sessiz anı. Fazlalık yok.", "Kendinle arandaki mesafe kapanmış."],
    bodyEN: ["The quietest moment of the day. No excess.", "The distance between you and yourself, closed."],
    fabricTR: "Yıkanmış keten",
    fabricEN: "Washed linen",
    paletteTR: "Krem, kum",
    paletteEN: "Écru, sable",
    productionTR: "Atelier Istanbul",
    productionEN: "Atelier Istanbul",
  },
  mouvement: {
    tagTR: "Akışın içinde.",
    tagEN: "In the flow.",
    bodyTR: ["Hareket kısıtlanmaz.", "Gün hafifçe akar — onunla birlikte."],
    bodyEN: ["Movement is never constrained.", "The day flows gently — and so do you."],
    fabricTR: "Modal — İpek karışım",
    fabricEN: "Modal — Silk blend",
    paletteTR: "Taupe, ardoise",
    paletteEN: "Taupe, ardoise",
    productionTR: "Atelier Istanbul",
    productionEN: "Atelier Istanbul",
  },
  epure: {
    tagTR: "Netlik yeterlidir.",
    tagEN: "Clarity is enough.",
    bodyTR: ["Nerede durulduğu belli.", "Düzen kendiliğinden gelir, dayatılmaz."],
    bodyEN: ["Where to stand is clear.", "Order arrives on its own — never imposed."],
    fabricTR: "Organik pamuk — Jakarlı",
    fabricEN: "Organic cotton — Jacquard",
    paletteTR: "İvori, inci grisi",
    paletteEN: "Ivory, pearl grey",
    productionTR: "Atelier Istanbul",
    productionEN: "Atelier Istanbul",
  },
  noir: {
    tagTR: "Sessiz bir varlık.",
    tagEN: "A silent presence.",
    bodyTR: ["Dikkat istemez.", "Yine de hissedilir."],
    bodyEN: ["It asks for no attention.", "And yet, it is felt."],
    fabricTR: "Mat krep",
    fabricEN: "Matte crepe",
    paletteTR: "Derin siyah",
    paletteEN: "Deep noir",
    productionTR: "Atelier Istanbul",
    productionEN: "Atelier Istanbul",
  },
  heritage: {
    tagTR: "Kalan anlar.",
    tagEN: "The moments that stay.",
    bodyTR: ["Bazı günler sıradan kalmak istemez.", "İz bırakmak için çaba değil, özen gerekir."],
    bodyEN: ["Some days refuse to be ordinary.", "Leaving a mark takes care, not effort."],
    fabricTR: "İpek dokuma",
    fabricEN: "Silk weave",
    paletteTR: "Amber, sıcak kahve",
    paletteEN: "Amber, warm brown",
    productionTR: "Atelier Istanbul",
    productionEN: "Atelier Istanbul",
  },
  atelier: {
    tagTR: "Tek parça. Tek ifade.",
    tagEN: "One piece. One expression.",
    bodyTR: ["Herkese ait olmayan seçimler.", "Detay fark edilir. Sadece sana ait olan bu."],
    bodyEN: ["Choices that don't belong to everyone.", "The detail is noticed. This one is only yours."],
    fabricTR: "El dokuması yün — Sınırlı üretim",
    fabricEN: "Hand-woven wool — Limited edition",
    paletteTR: "Konyak, siyah",
    paletteEN: "Cognac, noir",
    productionTR: "Atelier Istanbul",
    productionEN: "Atelier Istanbul",
  },
};

// ─── UI stringleri ────────────────────────────────────────────────────────────

const ui = {
  TR: {
    breadcrumbParent: "LOOKBOOK",
    silhouetteLabel: "SİLÜET",
    fabric: "KUMAŞ",
    palette: "PALET",
    production: "ÜRETİM",
    next: "SİLÜET",
    notFound: "Koleksiyon bulunamadı.",
    backLink: "Lookbook'a dön",
  },
  EN: {
    breadcrumbParent: "LOOKBOOK",
    silhouetteLabel: "SILHOUETTE",
    fabric: "FABRIC",
    palette: "PALETTE",
    production: "PRODUCTION",
    next: "SILHOUETTE",
    notFound: "Collection not found.",
    backLink: "Back to Lookbook",
  },
  AR: {
    breadcrumbParent: "LOOKBOOK",
    silhouetteLabel: "صورة ظلية",
    fabric: "القماش",
    palette: "اللوحة",
    production: "الإنتاج",
    next: "صورة ظلية",
    notFound: "المجموعة غير موجودة.",
    backLink: "العودة إلى Lookbook",
  },
};

const lookbookRoot = { TR: "/lookbook", EN: "/en/lookbook", AR: "/ar/lookbook" };

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function LookbookDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL } = useLanguage();
  const t = ui[lang];

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCollections()
      .then(res => {
        const sorted = [...res.data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setCollections(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentIndex = collections.findIndex(c => c.slug === slug);
  const current = collections[currentIndex] ?? null;
  const next = collections[currentIndex + 1] ?? null;
  const colMeta = slug ? meta[slug] : undefined;

  const tag = lang === "TR" ? colMeta?.tagTR : colMeta?.tagEN;
  const body = lang === "TR" ? colMeta?.bodyTR : colMeta?.bodyEN;
  const fabric = lang === "TR" ? colMeta?.fabricTR : colMeta?.fabricEN;
  const palette = lang === "TR" ? colMeta?.paletteTR : colMeta?.paletteEN;
  const production = lang === "TR" ? colMeta?.productionTR : colMeta?.productionEN;

  return (
    <div className="min-h-screen bg-[#F7F3EC]" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8">
        <nav className="flex items-center gap-2 font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/40">
          <Link href={lookbookRoot[lang]} className="hover:text-[#C9A96E] transition-colors">
            {t.breadcrumbParent}
          </Link>
          <span>/</span>
          <span className="text-[#1C1C1E]/70">
            {t.silhouetteLabel} {loading ? "—" : String(currentIndex + 1).padStart(2, "0")}
          </span>
        </nav>
      </div>

      {/* ── Ana layout ── */}
      {loading ? (
        <div className="flex flex-col lg:flex-row min-h-[80vh] mt-6">
          <div className="lg:w-[58%] bg-[#E8E0D5] animate-pulse min-h-[60vh]" />
          <div className="lg:w-[42%] p-14 space-y-6">
            <div className="h-3 bg-[#E8E0D5] rounded animate-pulse w-32" />
            <div className="h-10 bg-[#E8E0D5] rounded animate-pulse w-full" />
            <div className="h-4 bg-[#E8E0D5] rounded animate-pulse w-2/3" />
          </div>
        </div>
      ) : !current ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="font-body text-sm text-[#1C1C1E]/50 mb-6">{t.notFound}</p>
            <Link href={lookbookRoot[lang]}>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] border-b border-[#C9A96E]/40 pb-0.5 cursor-pointer">
                {t.backLink}
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-[85vh] mt-6">
          {/* ── Görsel %58 ── */}
          <div className="relative overflow-hidden lg:w-[58%] min-h-[60vh] lg:min-h-[85vh]">
            {current.imageUrl ? (
              <img src={current.imageUrl} alt={current.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#E8E0D5]" />
            )}
          </div>

          {/* ── İçerik %42 ── */}
          <div className="lg:w-[42%] bg-[#F7F3EC] flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-20">
            <div className="max-w-sm">
              {/* Sezon + sıra */}
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-5">
                {SEASON} — N° {String(currentIndex + 1).padStart(2, "0")}
              </p>

              {/* Koleksiyon adı */}
              <p className="font-body text-xs tracking-[0.4em] uppercase text-[#1C1C1E] mb-5">{current.name}</p>

              {/* Tagline — büyük italic */}
              {tag && (
                <h1 className="font-display text-3xl lg:text-4xl italic text-[#1C1C1E] leading-tight mb-5">{tag}</h1>
              )}

              {/* Altın ayraç */}
              <div className="w-10 h-px bg-[#C9A96E] mb-6" />

              {/* Gövde */}
              {body && (
                <div className="space-y-3 mb-8">
                  {body.map((line, i) => (
                    <p key={i} className="font-body text-sm text-[#1C1C1E]/65 leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Meta tablo */}
              {(fabric || palette || production) && (
                <>
                  <div className="w-full h-px bg-[#1C1C1E]/10 mb-6" />
                  <div className="space-y-3 mb-10">
                    {fabric && (
                      <div className="flex gap-6">
                        <span className="font-body text-[9px] tracking-[0.25em] uppercase text-[#C9A96E] w-20 shrink-0 pt-0.5">
                          {t.fabric}
                        </span>
                        <span className="font-body text-xs text-[#1C1C1E]/60">{fabric}</span>
                      </div>
                    )}
                    {palette && (
                      <div className="flex gap-6">
                        <span className="font-body text-[9px] tracking-[0.25em] uppercase text-[#C9A96E] w-20 shrink-0 pt-0.5">
                          {t.palette}
                        </span>
                        <span className="font-body text-xs text-[#1C1C1E]/60">{palette}</span>
                      </div>
                    )}
                    {production && (
                      <div className="flex gap-6">
                        <span className="font-body text-[9px] tracking-[0.25em] uppercase text-[#C9A96E] w-20 shrink-0 pt-0.5">
                          {t.production}
                        </span>
                        <span className="font-body text-xs text-[#1C1C1E]/60">{production}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Sonraki koleksiyon */}
              {next && (
                <div className="border-t border-[#1C1C1E]/10 pt-5">
                  <Link href={`${lookbookRoot[lang]}/${next.slug}`}>
                    <span className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.25em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer group">
                      {t.next} {String(currentIndex + 2).padStart(2, "0")} — {next.name}
                      <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Editorial footer şeridi ── */}
      <div className="border-t border-[#1C1C1E]/8 px-6 lg:px-12 py-5 flex items-center justify-between">
        <p className="font-body text-[9px] tracking-[0.3em] uppercase text-[#1C1C1E]/30">VOILÉE — ISTANBUL</p>
        <p className="font-body text-[9px] tracking-[0.3em] uppercase text-[#1C1C1E]/30">{SEASON}</p>
      </div>

      <Footer />
    </div>
  );
}
