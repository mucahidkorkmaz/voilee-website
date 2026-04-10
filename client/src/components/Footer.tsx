import { Instagram, Twitter, Linkedin } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_logo_2e68b438.webp";

export default function Footer() {
  const { lang, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const getFooterContent = () => {
    switch (lang) {
      case "EN":
        return {
          newsletter: "Newsletter",
          newsletterTitle: "Be the first to know\nabout new collections.",
          newsletterDesc: "Get updates on new releases, exclusive offers, and behind-the-scenes content.",
          placeholder: "Your email address",
          subscribe: "Subscribe",
          thanks: "Thank you for subscribing!",
          collections: "Collections",
          company: "Company",
          support: "Support",
          legal: "Legal",
          collectionLinks: [
            { label: "ORIGINE", href: "/en/collections" },
            { label: "MOUVEMENT", href: "/en/collections" },
            { label: "ÉPURE", href: "/en/collections" },
            { label: "NOIR", href: "/en/collections" },
            { label: "HÉRITAGE", href: "/en/collections" },
            { label: "ATELIER", href: "/en/collections" },
          ],
          companyLinks: [
            { label: "About", href: "/en/about" },
            { label: "Our Story", href: "/en/story" },
            { label: "Sustainability", href: "/en/sustainability" },
            { label: "Journal", href: "/en/journal" },
          ],
          supportLinks: [
            { label: "Size Guide", href: "/en/size-guide" },
            { label: "Shipping & Returns", href: "/en/shipping-returns" },
            { label: "Contact", href: "/en/contact" },
            { label: "WhatsApp", href: "https://wa.me/905000000000" },
          ],
          legalLinks: [
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
            { label: "KVKK", href: "#" },
          ],
          copyright: "© 2023 VOILÉE. All rights reserved.",
          location: "Istanbul, Turkey",
          contact: "info@voilee.com.tr",
        };
      case "AR":
        return {
          newsletter: "النشرة الإخبارية",
          newsletterTitle: "كن أول من يعرف\nعن المجموعات الجديدة.",
          newsletterDesc: "احصل على تحديثات حول الإصدارات الجديدة والعروض الحصرية والمحتوى خلف الكواليس.",
          placeholder: "عنوان بريدك الإلكتروني",
          subscribe: "اشترك",
          thanks: "شكراً لاشتراكك!",
          collections: "المجموعات",
          company: "الشركة",
          support: "الدعم",
          legal: "القانونية",
          collectionLinks: [
            { label: "ORIGINE", href: "/ar/collections" },
            { label: "MOUVEMENT", href: "/ar/collections" },
            { label: "ÉPURE", href: "/ar/collections" },
            { label: "NOIR", href: "/ar/collections" },
            { label: "HÉRITAGE", href: "/ar/collections" },
            { label: "ATELIER", href: "/ar/collections" },
          ],
          companyLinks: [
            { label: "من نحن", href: "/ar/about" },
            { label: "قصتنا", href: "/ar/story" },
            { label: "الاستدامة", href: "/ar/sustainability" },
            { label: "مجلة", href: "/ar/journal" },
          ],
          supportLinks: [
            { label: "دليل الأحجام", href: "/ar/size-guide" },
            { label: "الشحن والعودة", href: "/ar/shipping-returns" },
            { label: "اتصل بنا", href: "/ar/contact" },
            { label: "واتس آب", href: "https://wa.me/905000000000" },
          ],
          legalLinks: [
            { label: "سياسة الخصوصية", href: "#" },
            { label: "شروط الخدمة", href: "#" },
            { label: "KVKK", href: "#" },
          ],
          copyright: "© 2023 VOILÉE. جميع الحقوق محفوظة.",
          location: "اسطنبول، تركيا",
          contact: "info@voilee.com.tr",
        };
      default: // TR
        return {
          newsletter: "Bülten",
          newsletterTitle: "Yeni koleksiyonlardan\nilk siz haberdar olun.",
          newsletterDesc: "Yeni ürünler, özel teklifler ve atölye içerikleri hakkında güncellemeler alın.",
          placeholder: "E-posta adresiniz",
          subscribe: "Abone Ol",
          thanks: "Aboneliğiniz için teşekkür ederiz!",
          collections: "Koleksiyonlar",
          company: "Şirket",
          support: "Destek",
          legal: "Yasal",
          collectionLinks: [
            { label: "ORIGINE", href: "/koleksiyonlar" },
            { label: "MOUVEMENT", href: "/koleksiyonlar" },
            { label: "ÉPURE", href: "/koleksiyonlar" },
            { label: "NOIR", href: "/koleksiyonlar" },
            { label: "HÉRITAGE", href: "/koleksiyonlar" },
            { label: "ATELIER", href: "/koleksiyonlar" },
          ],
          companyLinks: [
            { label: "Hakkımızda", href: "/hakkimizda" },
            { label: "Hikayemiz", href: "/hikayemiz" },
            { label: "Sürdürülebilirlik", href: "/surdurulebilirlik" },
            { label: "Journal", href: "/journal" },
          ],
          supportLinks: [
            { label: "Beden Rehberi", href: "/beden-rehberi" },
            { label: "Kargo & İade", href: "/kargo-iade" },
            { label: "İletişim", href: "/iletisim" },
            { label: "WhatsApp", href: "https://wa.me/905000000000" },
          ],
          legalLinks: [
            { label: "Gizlilik Politikası", href: "#" },
            { label: "Kullanım Koşulları", href: "#" },
            { label: "KVKK", href: "#" },
          ],
          copyright: "© 2023 VOILÉE. Tüm hakları saklıdır.",
          location: "İstanbul, Türkiye",
          contact: "info@voilee.com.tr",
        };
    }
  };

  const content = getFooterContent();

  return (
    <footer className="bg-[#1C1C1E] text-[#F7F3EC]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Newsletter Banner */}
      <div className="border-b border-[#F7F3EC]/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className={`grid lg:grid-cols-2 gap-8 items-center ${isRTL ? "text-right" : ""}`}>
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-3">
                {content.newsletter}
              </p>
              <h3 className="font-display text-3xl lg:text-4xl text-[#F7F3EC] leading-tight whitespace-pre-line">
                {content.newsletterTitle}
              </h3>
            </div>
            <div>
              {subscribed ? (
                <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 p-6">
                  <p className="font-body text-sm text-[#F7F3EC]">{content.thanks}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder={content.placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border border-[#F7F3EC]/20 px-4 py-3 font-body text-sm text-[#F7F3EC] placeholder-[#F7F3EC]/40 focus:outline-none focus:border-[#C9A96E] transition-colors"
                    required
                  />
                  <button type="submit" className="btn-luxury btn-luxury-filled justify-center">
                    {content.subscribe}
                  </button>
                  <p className="font-body text-xs text-[#F7F3EC]/40">
                    {content.newsletterDesc}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="border-b border-[#F7F3EC]/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Collections */}
            <div>
              <h4 className={`font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] mb-4 ${isRTL ? "text-right" : ""}`}>
                {content.collections}
              </h4>
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {content.collectionLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="font-body text-sm text-[#F7F3EC]/60 hover:text-[#C9A96E] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className={`font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] mb-4 ${isRTL ? "text-right" : ""}`}>
                {content.company}
              </h4>
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {content.companyLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="font-body text-sm text-[#F7F3EC]/60 hover:text-[#C9A96E] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className={`font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] mb-4 ${isRTL ? "text-right" : ""}`}>
                {content.support}
              </h4>
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {content.supportLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="font-body text-sm text-[#F7F3EC]/60 hover:text-[#C9A96E] transition-colors" target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className={`font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] mb-4 ${isRTL ? "text-right" : ""}`}>
                {content.legal}
              </h4>
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {content.legalLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="font-body text-sm text-[#F7F3EC]/60 hover:text-[#C9A96E] transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid lg:grid-cols-3 gap-8 items-center ${isRTL ? "text-right" : ""}`}>
          <div>
            <img src={LOGO_URL} alt="VOILÉE" className="h-6 w-auto object-contain mb-4" />
            <p className="font-body text-xs text-[#F7F3EC]/40">
              {lang === "TR"
                ? "Koleksiyon yapmıyoruz. Siluet kuruyoruz."
                : lang === "EN"
                ? "We don't create collections. We build silhouettes."
                : "نحن لا نصنع مجموعات. نحن نبني صور ظلية."}
            </p>
          </div>
          <div className={`${isRTL ? "text-right" : ""}`}>
            <p className="font-body text-xs text-[#F7F3EC]/60 mb-2">{content.location}</p>
            <a href={`mailto:${content.contact}`} className="font-body text-xs text-[#C9A96E] hover:text-[#C9A96E]/80 transition-colors">
              {content.contact}
            </a>
          </div>
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse justify-end lg:justify-start" : ""}`}>
            <a href="#" className="text-[#F7F3EC]/60 hover:text-[#C9A96E] transition-colors">
              <Instagram size={16} />
            </a>
            <a href="#" className="text-[#F7F3EC]/60 hover:text-[#C9A96E] transition-colors">
              <Twitter size={16} />
            </a>
            <a href="#" className="text-[#F7F3EC]/60 hover:text-[#C9A96E] transition-colors">
              <Linkedin size={16} />
            </a>
          </div>
        </div>
        <div className={`border-t border-[#F7F3EC]/10 mt-8 pt-8 text-center ${isRTL ? "text-right" : ""}`}>
          <p className="font-body text-xs text-[#F7F3EC]/40">{content.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
