import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const IMGS = {
  about: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_about-koUYMmwRdG337Rztgx3iuQ.webp",
  heroMain: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_main-Z5A8u2f2u9H3JoSTeyVYih.webp",
  heroOrigine: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_origine-gGGQSDVPAKHHXiL3dcqJVR.webp",
  lookbook: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_lookbook-NdUh3UyfmAcub83uXdTERo.webp",
};

const values = [
  {
    numTR: "01", numEN: "01",
    titleTR: "Doğadan Gelen",
    titleEN: "From Nature",
    descTR: "Tüm kumaşlarımız doğal ve sürdürülebilir kaynaklardan seçilir. Organik pamuk, keten, ipek ve modal — cildinizin nefes aldığı lifler.",
    descEN: "All our fabrics are selected from natural and sustainable sources. Organic cotton, linen, silk and modal — fibers that let your skin breathe.",
  },
  {
    numTR: "02", numEN: "02",
    titleTR: "Az ve Özenli",
    titleEN: "Little and Careful",
    descTR: "Her silüetimiz sınırlı adetlerde üretilir. Bu, her parçanın gerçek bir değer taşıdığı anlamına gelir.",
    descEN: "Each of our silhouettes is produced in limited quantities. This means each piece carries real value.",
  },
  {
    numTR: "03", numEN: "03",
    titleTR: "Zamansız Tasarım",
    titleEN: "Timeless Design",
    descTR: "Trendlerin peşinden gitmeyen tasarımlar yaratıyoruz. Her parça, yıllar sonra da aynı zarafeti taşır.",
    descEN: "We create designs that don't chase trends. Each piece carries the same elegance years later.",
  },
  {
    numTR: "04", numEN: "04",
    titleTR: "Sessiz Lüks",
    titleEN: "Quiet Luxury",
    descTR: "Lüks, gürültüyle değil sessizlikle hissedilir. Kalite, dikkat istemeden fark edilir.",
    descEN: "Luxury is felt not with noise but with silence. Quality is noticed without asking for attention.",
  },
];

export default function About() {
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
        <img src={IMGS.about} alt="About VOILÉE" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-[#C9A96E] mb-3">
              {getText("Hakkımızda", "About Us", "عننا")}
            </p>
            <h1 className="font-display text-5xl lg:text-6xl text-white">VOILÉE</h1>
          </div>
        </div>
      </div>

      {/* Manifesto */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-6">
                {getText("Manifestomuz", "Our Manifesto", "بياننا")}
              </p>
              <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E] leading-[1.2] mb-8">
                {lang === "TR"
                  ? "Biz koleksiyon yapmıyoruz. Siluet kuruyoruz."
                  : "We don't make collections. We build silhouettes."}
              </h2>
              <div className="w-12 h-px bg-[#C9A96E] mb-8" />
              <div className="space-y-4 font-body text-sm text-[#1C1C1E]/70 leading-relaxed">
                <p>
                  {lang === "TR"
                    ? "Farklı kadınlar için değil, aynı kadının gün ve zaman içindeki hâlleri için tasarlıyoruz. Sabahın sessizliğinde, öğlenin hareketinde, akşamın gücünde — her an için bir siluet."
                    : "We design not for different women, but for the same woman in her different states throughout the day and time. In the silence of morning, in the movement of noon, in the power of evening — a silhouette for every moment."}
                </p>
                <p>
                  {lang === "TR"
                    ? "Stil önermiyoruz. Bir duruşu tarif ediyoruz. Gün içinde değişen ama özü değişmeyen kadına eşlik ediyoruz."
                    : "We don't suggest style. We describe a posture. We accompany the woman who changes throughout the day but whose essence remains unchanged."}
                </p>
                <p>
                  {lang === "TR"
                    ? "Fazlalık olmadığında geriye duruş kalır. Netlik, abartıya ihtiyaç duymaz. Varlık, dikkat istemeden hissedilir. VOILÉE, bu hâllerin siluetidir."
                    : "When there is no excess, only posture remains. Clarity doesn't need exaggeration. Presence is felt without asking for attention. VOILÉE is the silhouette of these states."}
                </p>
              </div>
            </div>
            <div className="relative">
              <img src={IMGS.heroMain} alt="VOILÉE" className="w-full aspect-[4/5] object-cover" />
              <div className="absolute -bottom-4 -right-4 bg-[#C9A96E] p-6">
                <p className="font-display text-3xl text-white">VOILÉE</p>
                <p className="font-body text-xs text-white/70 tracking-[0.15em] uppercase mt-1">Designed with Intention</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-[#1C1C1E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
              {getText("Değerlerimiz", "Our Values", "Our Values")}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl text-[#F7F3EC]">
              {getText("Bizi Biz Yapan", "What Makes Us Us", "What Makes Us Us")}
            </h2>
          </div>
          <div className="grid lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="border-t border-[#F7F3EC]/10 pt-8">
                <p className="font-display text-4xl text-[#C9A96E]/30 mb-4">{v.numTR}</p>
                <h3 className="font-display text-xl text-[#F7F3EC] mb-4">
                  {lang === "TR" ? v.titleTR : v.titleEN}
                </h3>
                <p className="font-body text-sm text-[#F7F3EC]/50 leading-relaxed">
                  {lang === "TR" ? v.descTR : v.descEN}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Atelier Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <img src={IMGS.about} alt="Atelier" className="w-full aspect-[4/3] object-cover" />
            </div>
            <div className="order-1 lg:order-2">
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-6">
                {getText("Atölyemiz", "Our Atelier", "Our Atelier")}
              </p>
              <h2 className="font-display text-4xl lg:text-5xl text-[#1C1C1E] leading-[1.2] mb-6">
                {getText("Her Parça,\nBir Özen Hikayesi", "Each Piece,\nA Story of Care", "Each Piece,\nA Story of Care")}
              </h2>
              <div className="w-12 h-px bg-[#C9A96E] mb-6" />
              <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed mb-6">
                {lang === "TR"
                  ? "Türkiye'nin en deneyimli ustalarıyla çalışıyoruz. Her dikiş, her detay, her kumaş seçimi — hepsi bilinçli bir kararın ürünü."
                  : "We work with Turkey's most experienced craftspeople. Every stitch, every detail, every fabric choice — all the product of a conscious decision."}
              </p>
              <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed">
                {lang === "TR"
                  ? "Düşük adetli üretimimiz, her parçanın gerçek bir özen ve dikkatle üretilmesini sağlar. Kitlesel üretimin aksine, biz her parçayı tanırız."
                  : "Our low-volume production ensures each piece is made with real care and attention. Unlike mass production, we know each piece."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#F0EBE1]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { numTR: "2023", numEN: "2023", labelTR: "Kuruluş Yılı", labelEN: "Founded" },
              { numTR: "6", numEN: "6", labelTR: "Silüet", labelEN: "Silhouettes" },
              { numTR: "%100", numEN: "100%", labelTR: "Doğal Kumaş", labelEN: "Natural Fabric" },
              { numTR: "40+", numEN: "40+", labelTR: "Ülkeye Kargo", labelEN: "Countries Shipped" },
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
