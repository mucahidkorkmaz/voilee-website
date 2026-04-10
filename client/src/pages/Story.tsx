import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Leaf, Users, Sparkles } from "lucide-react";

const IMGS = {
  cdnOrigine: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_origine_57e73407.webp",
  about: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_about-koUYMmwRdG337Rztgx3iuQ.webp",
  cdnAtelier: "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_cdn_atelier_d60dabd2.webp",
};

const content = {
  TR: {
    title: "Hikayemiz",
    subtitle: "Sessiz Lüksün Doğuşu",
    intro: "VOILÉE, bir kadının kendi duruşunu keşfetme yolculuğundan doğdu. 2023'te İstanbul'da kurulmuş olan bu marka, sadece elbise satmaz — bir yaşam felsefesini sunar.",
    sections: [
      {
        title: "Başlangıç: Bir Sorunun Cevabı",
        text: "Geleneksel modest fashion pazarında, iki seçenek vardı: Ya çok basit, ya çok gösterişli. Arası yoktu. Bir kadın, hem etik hem zarafet arayan, hem modern hem zamansız olan bir parça bulmak istiyordu. Onu bulamadığında, kendisi yaratmaya karar verdi.\n\nVOILÉE'nin ilk koleksiyonu, bu sorunun cevabıydı: Sessiz bir gücü, kalıcı bir zarafeti temsil eden parçalar.",
        icon: Heart,
      },
      {
        title: "Felsefe: Sessiz Lüks",
        text: "Sessiz lüks, gürültü olmadan var olmaktır. Dikkat çekmeden fark edilmektir. VOILÉE'nin her parçası, bu felsefenin bir manifestosudur.\n\nBiz koleksiyon yapmıyoruz, siluet kuruyoruz. Farklı kadınlar için değil, aynı kadının gün ve zaman içindeki hâlleri için. Sabahın sessizliğinden gecenin gücüne, her an için bir duruş.",
        icon: Sparkles,
      },
      {
        title: "Üretim: Etik ve Zanaat",
        text: "Her VOILÉE parçası, İstanbul'daki atölyemizde, uzman terzi ve tasarımcılar tarafından dikkatle üretilir. Doğal kumaşlar (organik pamuk, keten, ipek), sürdürülebilir boyalar, düşük adet üretim — her adım, gezegenimize ve işçilerimize saygıyla yapılır.\n\nKalite, asla kısa yoldan elde edilmez.",
        icon: Leaf,
      },
      {
        title: "Vizyon: Türkiye'den Dünyaya",
        text: "2023'de İstanbul'da başladık. Bugün, Türkiye'nin her köşesine, Avrupa'ya, Orta Doğu'ya ulaştık. Ama bu sadece bir başlangıç. VOILÉE, sessiz lüksü dünyaya tanıtmak istiyor.\n\nHer kültürde, her pazarda, aynı değerleri koruyarak büyüyoruz: Etik, Zarafet, Niyetlilik.",
        icon: Users,
      },
    ],
    values: [
      { title: "Etik Üretim", desc: "Doğal kumaşlar, adil ücretler, düşük adet" },
      { title: "Zamansız Tasarım", desc: "Trendler değil, kalıcı siluetler" },
      { title: "Kadın Güçlendirmesi", desc: "Her parça, bir kadının duruşudur" },
      { title: "Niyetlilik", desc: "Her karar, bir amacı vardır" },
    ],
    cta: "Koleksiyonu Keşfet",
  },
  EN: {
    title: "Our Story",
    subtitle: "The Birth of Quiet Luxury",
    intro: "VOILÉE was born from a woman's journey to discover her own posture. Founded in Istanbul in 2023, this brand doesn't just sell clothes — it offers a philosophy of life.",
    sections: [
      {
        title: "The Beginning: An Answer to a Problem",
        text: "In the traditional modest fashion market, there were only two options: either too simple or too ostentatious. Nothing in between. A woman wanted to find a piece that was both ethical and elegant, both modern and timeless. When she couldn't find it, she decided to create it.\n\nVOILÉE's first collection was the answer to that problem: pieces representing a quiet strength and lasting elegance.",
        icon: Heart,
      },
      {
        title: "Philosophy: Quiet Luxury",
        text: "Quiet luxury is existing without noise. Being noticed without drawing attention. Every VOILÉE piece is a manifesto of this philosophy.\n\nWe don't create collections, we build silhouettes. Not for different women, but for the same woman in her different moments. From the silence of morning to the power of night, a posture for every moment.",
        icon: Sparkles,
      },
      {
        title: "Production: Ethics and Craft",
        text: "Every VOILÉE piece is carefully produced in our Istanbul atelier by skilled tailors and designers. Natural fabrics (organic cotton, linen, silk), sustainable dyes, limited production runs — every step is done with respect for our planet and our workers.\n\nQuality is never achieved through shortcuts.",
        icon: Leaf,
      },
      {
        title: "Vision: From Turkey to the World",
        text: "We started in Istanbul in 2023. Today, we reach every corner of Turkey, Europe, and the Middle East. But this is just the beginning. VOILÉE wants to introduce quiet luxury to the world.\n\nWe grow in every culture and market while preserving the same values: Ethics, Elegance, Intention.",
        icon: Users,
      },
    ],
    values: [
      { title: "Ethical Production", desc: "Natural fabrics, fair wages, limited runs" },
      { title: "Timeless Design", desc: "Trends fade, silhouettes endure" },
      { title: "Women Empowerment", desc: "Every piece is a woman's posture" },
      { title: "Intention", desc: "Every decision has a purpose" },
    ],
    cta: "Explore Collection",
  },
  AR: {
    title: "قصتنا",
    subtitle: "ولادة الفخامة الهادئة",
    intro: "وُلدت VOILÉE من رحلة امرأة لاكتشاف موقفها الخاص. تأسست في اسطنبول عام 2023، هذه العلامة التجارية لا تبيع الملابس فقط — بل تقدم فلسفة للحياة.",
    sections: [
      {
        title: "البداية: إجابة على مشكلة",
        text: "في سوق الموضة المتحفظة التقليدية، كان هناك خياران فقط: إما بسيط جداً أو براق جداً. لا شيء في الوسط. أرادت امرأة أن تجد قطعة أنيقة وأخلاقية، حديثة وخالدة. عندما لم تجدها، قررت أن تنشئها بنفسها.\n\nكانت أول مجموعة من VOILÉE هي الإجابة على تلك المشكلة: قطع تمثل قوة هادئة وأناقة دائمة.",
        icon: Heart,
      },
      {
        title: "الفلسفة: الفخامة الهادئة",
        text: "الفخامة الهادئة هي الوجود بدون ضوضاء. أن تُلاحظي دون لفت الانتباه. كل قطعة من VOILÉE هي بيان لهذه الفلسفة.\n\nنحن لا نصنع مجموعات، بل نبني صور ظلية. ليس لنساء مختلفات، بل لنفس المرأة في لحظاتها المختلفة. من هدوء الصباح إلى قوة الليل، موقف لكل لحظة.",
        icon: Sparkles,
      },
      {
        title: "الإنتاج: الأخلاق والحرفة",
        text: "يتم إنتاج كل قطعة من VOILÉE بعناية في أتيليه اسطنبول الخاص بنا من قبل خياطين ومصممين ماهرين. أقمشة طبيعية (قطن عضوي، كتان، حرير)، صبغات مستدامة، إنتاج محدود — كل خطوة تتم باحترام لكوكبنا وعمالنا.\n\nالجودة لا تُحقق أبداً من خلال الطرق المختصرة.",
        icon: Leaf,
      },
      {
        title: "الرؤية: من تركيا إلى العالم",
        text: "بدأنا في اسطنبول عام 2023. اليوم، نصل إلى كل زاوية من تركيا وأوروبا والشرق الأوسط. لكن هذه مجرد البداية. تريد VOILÉE أن تقدم الفخامة الهادئة للعالم.\n\nننمو في كل ثقافة وسوق مع الحفاظ على نفس القيم: الأخلاق والأناقة والنية.",
        icon: Users,
      },
    ],
    values: [
      { title: "الإنتاج الأخلاقي", desc: "أقمشة طبيعية، أجور عادلة، إنتاج محدود" },
      { title: "التصميم الخالد", desc: "الاتجاهات تتلاشى، الصور الظلية تبقى" },
      { title: "تمكين المرأة", desc: "كل قطعة هي موقف امرأة" },
      { title: "النية", desc: "لكل قرار غرض" },
    ],
    cta: "استكشف المجموعة",
  },
};

export default function Story() {
  const { lang } = useLanguage();
  const t = content[lang as keyof typeof content];

  
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      {/* Hero */}
      <div className="pt-28 pb-16 bg-gradient-to-b from-[#1C1C1E] to-[#F7F3EC]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className={`font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-4 ${lang === "AR" ? "text-right" : ""}`}>
            {lang === "AR" ? "علامتنا التجارية" : lang === "EN" ? "Our Brand" : "Markamız"}
          </p>
          <h1 className={`font-display text-6xl lg:text-7xl text-[#F7F3EC] mb-6 ${lang === "AR" ? "text-right" : ""}`}>
            {t.title}
          </h1>
          <p className={`font-display text-2xl text-[#C9A96E] mb-8 max-w-2xl ${lang === "AR" ? "text-right" : ""}`}>
            {t.subtitle}
          </p>
          <p className={`font-body text-base text-[#F7F3EC]/80 leading-relaxed max-w-3xl ${lang === "AR" ? "text-right" : ""}`}>
            {t.intro}
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {t.sections.map((section, i) => {
          const Icon = section.icon;
          const isEven = i % 2 === 0;

          
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
            <div key={i} className={`grid lg:grid-cols-2 gap-12 mb-20 items-center ${isEven ? "" : "lg:grid-flow-dense"}`}>
              <div className={isEven ? "" : "lg:col-start-2"}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#C9A96E]/10 flex items-center justify-center">
                    <Icon size={24} className="text-[#C9A96E]" />
                  </div>
                  <h2 className={`font-display text-3xl text-[#1C1C1E] ${lang === "AR" ? "text-right" : ""}`}>
                    {section.title}
                  </h2>
                </div>
                <p className={`font-body text-base text-[#1C1C1E]/70 leading-relaxed whitespace-pre-line ${lang === "AR" ? "text-right" : ""}`}>
                  {section.text}
                </p>
              </div>
              <div className={`overflow-hidden ${isEven ? "" : "lg:col-start-1"}`}>
                <img
                  src={[IMGS.cdnOrigine, IMGS.about, IMGS.cdnAtelier, IMGS.cdnOrigine][i]}
                  alt={section.title}
                  className="w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Values */}
      <div className="bg-[#1C1C1E] py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`font-display text-4xl text-[#F7F3EC] mb-12 text-center ${lang === "AR" ? "text-right" : ""}`}>
            {lang === "AR" ? "قيمنا" : lang === "EN" ? "Our Values" : "Değerlerimiz"}
          </h2>
          <div className="grid lg:grid-cols-4 gap-6">
            {t.values.map((value, i) => (
              <div key={i} className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 p-6">
                <h3 className={`font-body text-sm font-medium text-[#C9A96E] mb-3 ${lang === "AR" ? "text-right" : ""}`}>
                  {value.title}
                </h3>
                <p className={`font-body text-xs text-[#F7F3EC]/60 ${lang === "AR" ? "text-right" : ""}`}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-[#F7F3EC]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-sm text-[#1C1C1E]/60 mb-6">
            {lang === "AR" ? "اكتشفي فلسفة VOILÉE" : lang === "EN" ? "Discover the VOILÉE philosophy" : "VOILÉE felsefesini keşfet"}
          </p>
          <button className="btn-luxury btn-luxury-filled">
            {t.cta}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
