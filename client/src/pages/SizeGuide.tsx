import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SizeGuide() {
  const { lang } = useLanguage();
  
  const [activeCategory, setActiveCategory] = useState<"abaya" | "esarp" | "canta">("abaya");

  const abayaSizes = [
    { size: "XS", bustTR: "80-84 cm", bustEN: "80-84 cm", waistTR: "62-66 cm", waistEN: "62-66 cm", hipTR: "88-92 cm", hipEN: "88-92 cm", lengthTR: "145-150 cm", lengthEN: "145-150 cm" },
    { size: "S", bustTR: "84-88 cm", bustEN: "84-88 cm", waistTR: "66-70 cm", waistEN: "66-70 cm", hipTR: "92-96 cm", hipEN: "92-96 cm", lengthTR: "148-153 cm", lengthEN: "148-153 cm" },
    { size: "M", bustTR: "88-94 cm", bustEN: "88-94 cm", waistTR: "70-76 cm", waistEN: "70-76 cm", hipTR: "96-102 cm", hipEN: "96-102 cm", lengthTR: "150-155 cm", lengthEN: "150-155 cm" },
    { size: "L", bustTR: "94-100 cm", bustEN: "94-100 cm", waistTR: "76-82 cm", waistEN: "76-82 cm", hipTR: "102-108 cm", hipEN: "102-108 cm", lengthTR: "152-157 cm", lengthEN: "152-157 cm" },
    { size: "XL", bustTR: "100-108 cm", bustEN: "100-108 cm", waistTR: "82-90 cm", waistEN: "82-90 cm", hipTR: "108-116 cm", hipEN: "108-116 cm", lengthTR: "154-160 cm", lengthEN: "154-160 cm" },
    { size: "2XL", bustTR: "108-116 cm", bustEN: "108-116 cm", waistTR: "90-98 cm", waistEN: "90-98 cm", hipTR: "116-124 cm", hipEN: "116-124 cm", lengthTR: "156-162 cm", lengthEN: "156-162 cm" },
  ];

  
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
              {getText("Rehber", "Guide", "Guide")}
            </p>
            <h1 className="font-display text-5xl text-[#1C1C1E]">
              {getText("Beden Rehberi", "Size Guide", "دليل الأحجام")}
            </h1>
          </div>

          <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 p-6 mb-10">
            <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed">
              {lang === "TR"
                ? "Doğru bedeni bulmak için vücut ölçülerinizi alın. Emin değilseniz, büyük bedeni tercih etmenizi öneririz. Tüm ölçümler vücuda yakın, nefes alır pozisyonda yapılmalıdır."
                : "Take your body measurements to find the right size. If unsure, we recommend choosing the larger size. All measurements should be taken close to the body in a relaxed, breathing position."}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-0 mb-10 border-b border-[#1C1C1E]/10">
            {(["abaya", "esarp", "canta"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-body text-xs tracking-[0.15em] uppercase px-6 py-3 border-b-2 transition-all duration-300 ${
                  activeCategory === cat
                    ? "border-[#C9A96E] text-[#1C1C1E]"
                    : "border-transparent text-[#1C1C1E]/40 hover:text-[#1C1C1E]/70"
                }`}
              >
                {cat === "abaya" ? "Abaya" : cat === "esarp" ? (getText("Eşarp", "Scarf", "Scarf")) : (getText("Çanta", "Bag", "Bag"))}
              </button>
            ))}
          </div>

          {activeCategory === "abaya" && (
            <div>
              <h2 className="font-display text-2xl text-[#1C1C1E] mb-6">
                {getText("Abaya Beden Tablosu", "Abaya Size Chart", "Abaya Size Chart")}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1C1C1E]">
                      <th className="font-body text-xs tracking-[0.1em] uppercase text-[#C9A96E] text-left py-4 px-4">
                        {getText("Beden", "Size", "Size")}
                      </th>
                      <th className="font-body text-xs tracking-[0.1em] uppercase text-[#F7F3EC]/60 text-left py-4 px-4">
                        {getText("Göğüs", "Bust", "Bust")}
                      </th>
                      <th className="font-body text-xs tracking-[0.1em] uppercase text-[#F7F3EC]/60 text-left py-4 px-4">
                        {getText("Bel", "Waist", "Waist")}
                      </th>
                      <th className="font-body text-xs tracking-[0.1em] uppercase text-[#F7F3EC]/60 text-left py-4 px-4">
                        {getText("Kalça", "Hip", "Hip")}
                      </th>
                      <th className="font-body text-xs tracking-[0.1em] uppercase text-[#F7F3EC]/60 text-left py-4 px-4">
                        {getText("Uzunluk", "Length", "Length")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {abayaSizes.map((row, i) => (
                      <tr key={i} className={`border-b border-[#1C1C1E]/5 ${i % 2 === 0 ? "bg-white" : "bg-[#F7F3EC]"}`}>
                        <td className="font-body text-sm font-medium text-[#C9A96E] py-4 px-4">{row.size}</td>
                        <td className="font-body text-sm text-[#1C1C1E]/70 py-4 px-4">{lang === "TR" ? row.bustTR : row.bustEN}</td>
                        <td className="font-body text-sm text-[#1C1C1E]/70 py-4 px-4">{lang === "TR" ? row.waistTR : row.waistEN}</td>
                        <td className="font-body text-sm text-[#1C1C1E]/70 py-4 px-4">{lang === "TR" ? row.hipTR : row.hipEN}</td>
                        <td className="font-body text-sm text-[#1C1C1E]/70 py-4 px-4">{lang === "TR" ? row.lengthTR : row.lengthEN}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeCategory === "esarp" && (
            <div>
              <h2 className="font-display text-2xl text-[#1C1C1E] mb-6">
                {getText("Eşarp Boyutları", "Scarf Dimensions", "Scarf Dimensions")}
              </h2>
              <div className="grid lg:grid-cols-3 gap-4">
                {[
                  { nameTR: "Kare Eşarp", nameEN: "Square Scarf", dimTR: "90 × 90 cm", dimEN: "90 × 90 cm", descTR: "Klasik katlama ve bağlama stilleri için ideal.", descEN: "Ideal for classic folding and tying styles." },
                  { nameTR: "Büyük Kare", nameEN: "Large Square", dimTR: "110 × 110 cm", dimEN: "110 × 110 cm", descTR: "Daha geniş örtünme ve şal kullanımı için.", descEN: "For wider coverage and shawl use." },
                  { nameTR: "Dikdörtgen Şal", nameEN: "Rectangular Shawl", dimTR: "70 × 180 cm", dimEN: "70 × 180 cm", descTR: "Modern bağlama stilleri ve omuz örtüsü için.", descEN: "For modern tying styles and shoulder coverage." },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 border border-[#C9A96E]/10">
                    <h3 className="font-body text-sm font-medium text-[#1C1C1E] mb-2">
                      {lang === "TR" ? item.nameTR : item.nameEN}
                    </h3>
                    <p className="font-display text-2xl text-[#C9A96E] mb-3">{lang === "TR" ? item.dimTR : item.dimEN}</p>
                    <p className="font-body text-xs text-[#1C1C1E]/60">{lang === "TR" ? item.descTR : item.descEN}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === "canta" && (
            <div>
              <h2 className="font-display text-2xl text-[#1C1C1E] mb-6">
                {getText("Çanta Boyutları", "Bag Dimensions", "Bag Dimensions")}
              </h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {[
                  { nameTR: "Mini Çanta", nameEN: "Mini Bag", dimTR: "18 × 14 × 6 cm", dimEN: "18 × 14 × 6 cm", descTR: "Akşam çıkışları ve özel günler için.", descEN: "For evening outings and special occasions." },
                  { nameTR: "Orta Boy", nameEN: "Medium", dimTR: "28 × 22 × 10 cm", dimEN: "28 × 22 × 10 cm", descTR: "Günlük kullanım için ideal boyut.", descEN: "Ideal size for daily use." },
                  { nameTR: "Büyük Boy", nameEN: "Large", dimTR: "38 × 30 × 14 cm", dimEN: "38 × 30 × 14 cm", descTR: "İş ve seyahat için geniş kapasiteli.", descEN: "Large capacity for work and travel." },
                  { nameTR: "Tote", nameEN: "Tote", dimTR: "42 × 35 × 15 cm", dimEN: "42 × 35 × 15 cm", descTR: "Alışveriş ve günlük taşıma için.", descEN: "For shopping and daily carrying." },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 border border-[#C9A96E]/10">
                    <h3 className="font-body text-sm font-medium text-[#1C1C1E] mb-2">
                      {lang === "TR" ? item.nameTR : item.nameEN}
                    </h3>
                    <p className="font-display text-2xl text-[#C9A96E] mb-3">{lang === "TR" ? item.dimTR : item.dimEN}</p>
                    <p className="font-body text-xs text-[#1C1C1E]/60">{lang === "TR" ? item.descTR : item.descEN}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Measuring Tips */}
          <div className="mt-12 p-8 bg-[#1C1C1E]">
            <h3 className="font-display text-2xl text-[#F7F3EC] mb-6">
              {getText("Nasıl Ölçüm Alınır?", "How to Take Measurements?", "How to Take Measurements?")}
            </h3>
            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { titleTR: "Göğüs", titleEN: "Bust", descTR: "Göğsün en geniş noktasından, kolların altından yatay olarak ölçün.", descEN: "Measure horizontally across the fullest part of the chest, under the arms." },
                { titleTR: "Bel", titleEN: "Waist", descTR: "Belinizin en ince noktasından, göbek deliğinin hemen üzerinden ölçün.", descEN: "Measure at the narrowest point of your waist, just above the navel." },
                { titleTR: "Kalça", titleEN: "Hip", descTR: "Kalçanızın en geniş noktasından yatay olarak ölçün.", descEN: "Measure horizontally across the fullest part of your hips." },
              ].map((tip, i) => (
                <div key={i}>
                  <h4 className="font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] mb-2">
                    {lang === "TR" ? tip.titleTR : tip.titleEN}
                  </h4>
                  <p className="font-body text-sm text-[#F7F3EC]/60 leading-relaxed">
                    {lang === "TR" ? tip.descTR : tip.descEN}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
