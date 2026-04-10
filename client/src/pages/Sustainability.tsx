import { useState } from "react";
import { Leaf, Droplets, Recycle, Heart, Sun, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const IMGS = {
  about: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_about-koUYMmwRdG337Rztgx3iuQ.webp",
  heroOrigine: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_origine-gGGQSDVPAKHHXiL3dcqJVR.webp",
};

const pillars = [
  { icon: Leaf, titleTR: "Doğal Kumaşlar", titleEN: "Natural Fabrics", descTR: "Organik pamuk, keten, ipek ve modal kullanıyoruz. Sentetik içerik sıfır.", descEN: "We use organic cotton, linen, silk and modal. Zero synthetic content." },
  { icon: Droplets, titleTR: "Su Tasarrufu", titleEN: "Water Conservation", descTR: "Geleneksel boyama yöntemlerine kıyasla %60 daha az su kullanıyoruz.", descEN: "We use 60% less water compared to traditional dyeing methods." },
  { icon: Recycle, titleTR: "Sıfır Atık", titleEN: "Zero Waste", descTR: "Kumaş artıkları aksesuar ve ambalaj malzemesine dönüştürülür.", descEN: "Fabric remnants are converted into accessories and packaging materials." },
  { icon: Heart, titleTR: "Adil Ücret", titleEN: "Fair Wage", descTR: "Tüm üretim ortaklarımız adil ücret ve çalışma koşulları sağlar.", descEN: "All our production partners provide fair wages and working conditions." },
  { icon: Sun, titleTR: "Yenilenebilir Enerji", titleEN: "Renewable Energy", descTR: "Atölyemiz %100 yenilenebilir enerji kaynakları ile çalışır.", descEN: "Our atelier operates on 100% renewable energy sources." },
  { icon: Package, titleTR: "Sürdürülebilir Ambalaj", titleEN: "Sustainable Packaging", descTR: "Tüm ambalajlarımız geri dönüştürülebilir veya biyobozunur malzemeden üretilir.", descEN: "All our packaging is made from recyclable or biodegradable materials." },
];

export default function Sustainability() {
  const { lang } = useLanguage();
  

  
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      {/* Hero */}
      <div className="relative h-72 lg:h-96 overflow-hidden">
        <img src={IMGS.heroOrigine} alt="Sustainability" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-3">
              {getText("Sürdürülebilirlik", "Sustainability", "الاستدامة")}
            </p>
            <h1 className="font-display text-5xl lg:text-6xl text-white">
              {getText("Dünyaya Saygı", "Respect for the World", "Respect for the World")}
            </h1>
          </div>
        </div>
      </div>

      {/* Intro */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-6">
              {getText("Taahhüdümüz", "Our Commitment", "Our Commitment")}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E] leading-[1.2] mb-8">
              {lang === "TR"
                ? "Moda, dünyaya zarar vermek zorunda değil."
                : "Fashion doesn't have to harm the world."}
            </h2>
            <div className="w-12 h-px bg-[#C9A96E] mx-auto mb-8" />
            <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed">
              {lang === "TR"
                ? "VOILÉE olarak, her tasarım kararında çevresel ve sosyal sorumluluğumuzu göz önünde bulunduruyoruz. Güzel olmak ile iyi olmak arasında bir çelişki görmüyoruz — aksine, bu ikisi birbirini tamamlar."
                : "As VOILÉE, we consider our environmental and social responsibility in every design decision. We see no contradiction between being beautiful and being good — on the contrary, these two complement each other."}
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-[#1C1C1E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-[#F7F3EC]">
              {getText("Sürdürülebilirlik Sütunlarımız", "Our Sustainability Pillars", "Our Sustainability Pillars")}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <div key={i} className="border border-[#F7F3EC]/10 p-8 hover:border-[#C9A96E]/40 transition-colors duration-300">
                <p.icon size={28} className="text-[#C9A96E] mb-6" />
                <h3 className="font-display text-xl text-[#F7F3EC] mb-3">
                  {lang === "TR" ? p.titleTR : p.titleEN}
                </h3>
                <p className="font-body text-sm text-[#F7F3EC]/50 leading-relaxed">
                  {lang === "TR" ? p.descTR : p.descEN}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fabrics Detail */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-6">
                {getText("Kumaşlarımız", "Our Fabrics", "Our Fabrics")}
              </p>
              <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E] leading-[1.2] mb-6">
                {getText("Doğadan Gelen\nKalite", "Quality\nFrom Nature", "Quality\nFrom Nature")}
              </h2>
              <div className="w-12 h-px bg-[#C9A96E] mb-8" />
              <div className="space-y-6">
                {[
                  { nameTR: "Organik Pamuk", nameEN: "Organic Cotton", descTR: "GOTS sertifikalı, pestisit içermeyen organik pamuk. Nefes alır, yumuşaktır.", descEN: "GOTS certified, pesticide-free organic cotton. Breathable and soft." },
                  { nameTR: "Keten (Linen)", nameEN: "Linen", descTR: "Doğal olarak antibakteriyel, serin tutan ve çevre dostu keten.", descEN: "Naturally antibacterial, cooling and eco-friendly linen." },
                  { nameTR: "İpek", nameEN: "Silk", descTR: "Etik koşullarda üretilmiş, doğal parlaklığıyla ipek.", descEN: "Silk produced under ethical conditions, with natural luster." },
                  { nameTR: "Modal", nameEN: "Modal", descTR: "Beech ağacından elde edilen, biyobozunur ve ultra yumuşak modal.", descEN: "Biodegradable and ultra-soft modal derived from beech trees." },
                ].map((fabric, i) => (
                  <div key={i} className="flex gap-4 pb-6 border-b border-[#C9A96E]/10 last:border-0">
                    <div className="w-1 bg-[#C9A96E] shrink-0 rounded-full" />
                    <div>
                      <h4 className="font-body text-sm font-medium text-[#1C1C1E] mb-1">
                        {lang === "TR" ? fabric.nameTR : fabric.nameEN}
                      </h4>
                      <p className="font-body text-xs text-[#1C1C1E]/60 leading-relaxed">
                        {lang === "TR" ? fabric.descTR : fabric.descEN}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img src={IMGS.about} alt="Fabrics" className="w-full aspect-[4/5] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-16 bg-[#F0EBE1]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { numTR: "%100", numEN: "100%", labelTR: "Doğal Kumaş", labelEN: "Natural Fabric" },
              { numTR: "%60", numEN: "60%", labelTR: "Su Tasarrufu", labelEN: "Water Saved" },
              { numTR: "0", numEN: "0", labelTR: "Kimyasal Boya", labelEN: "Chemical Dye" },
              { numTR: "%100", numEN: "100%", labelTR: "Geri Dönüşümlü Ambalaj", labelEN: "Recycled Packaging" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-display text-5xl text-[#C9A96E] mb-2">
                  {lang === "TR" ? stat.numTR : stat.numEN}
                </p>
                <p className="font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/50">
                  {lang === "TR" ? stat.labelTR : stat.labelEN}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
