import { Instagram, Twitter, Linkedin, Youtube, ArrowRight, ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sitePaths } from "@/lib/sitePaths";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_logo_2e68b438.webp";

type SocialSettings = {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  pinterestUrl?: string | null;
  linkedinUrl?: string | null;
  snapchatUrl?: string | null;
  whatsappUrl?: string | null;
  telegramUrl?: string | null;
};

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.8a8.18 8.18 0 0 0 4.78 1.52V6.88a4.85 4.85 0 0 1-1.01-.19z" />
    </svg>
  );
}

function PinterestIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function SnapchatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.07.041.174.083.316.083.22-.009.48-.104.75-.286.124-.09.287-.13.45-.13.16 0 .33.04.47.13.29.19.45.48.45.8 0 .5-.399.97-1.3 1.33-.13.05-.28.09-.43.13-.449.112-.893.438-1.046.85-.063.168-.019.356.112.507l.012.013c.919 1.13 2.547 3.121 2.547 3.121v.005c.18.199.348.424.348.424.3.326.45.774.45 1.226 0 .503-.17.946-.472 1.253-.303.307-.72.48-1.166.48-.44 0-.82-.143-1.125-.424l-.002-.002c-.362-.327-.702-.636-1.005-.885-.278-.231-.575-.464-.908-.576-.198-.065-.41-.065-.607 0l.034-.01c-.348.113-.663.37-.926.58-.3.24-.64.56-1.007.887l-.002.002c-.305.28-.684.424-1.125.424-.447 0-.863-.173-1.166-.48-.303-.307-.472-.75-.472-1.253 0-.452.15-.9.45-1.226 0 0 .167-.225.348-.424v-.005s1.628-1.99 2.547-3.12l.012-.014c.131-.15.175-.339.112-.507-.153-.412-.597-.738-1.046-.85-.15-.04-.3-.08-.43-.13C8.5 13.5 8.1 13.03 8.1 12.53c0-.32.16-.61.45-.8.14-.09.31-.13.47-.13.163 0 .326.04.45.13.27.182.53.277.75.286.142 0 .246-.042.316-.083-.008-.166-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C12.347.276 15.704 0 12.692 0L12.206.793z" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Footer() {
  const { lang, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [social, setSocial] = useState<SocialSettings>({});

  useEffect(() => {
    fetch("/api/v1/store-settings")
      .then(r => r.json())
      .then(data => setSocial(data))
      .catch(() => {});
  }, []);

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
          newsletter: "Subscribe to our Newsletter",
          placeholder: "Your email address",
          subscribe: "Subscribe",
          thanks: "Subscribed.",
          silhouettes: "Silhouettes",
          company: "Company",
          support: "Support",
          legal: "Legal",
          silhouetteLinks: [
            { label: "ORIGINE", href: "/en/silhouettes" },
            { label: "MOUVEMENT", href: "/en/silhouettes" },
            { label: "ÉPURE", href: "/en/silhouettes" },
            { label: "NOIR", href: "/en/silhouettes" },
            { label: "HÉRITAGE", href: "/en/silhouettes" },
            { label: "ATELIER", href: "/en/silhouettes" },
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
            ...(social.whatsappUrl ? [{ label: "WhatsApp", href: social.whatsappUrl }] : []),
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
          newsletter: "اشترك في نشرتنا",
          placeholder: "عنوان بريدك الإلكتروني",
          subscribe: "اشترك",
          thanks: "تم الاشتراك.",
          silhouettes: "الصور الظلية",
          company: "الشركة",
          support: "الدعم",
          legal: "القانونية",
          silhouetteLinks: [
            { label: "ORIGINE", href: "/ar/silhouettes" },
            { label: "MOUVEMENT", href: "/ar/silhouettes" },
            { label: "ÉPURE", href: "/ar/silhouettes" },
            { label: "NOIR", href: "/ar/silhouettes" },
            { label: "HÉRITAGE", href: "/ar/silhouettes" },
            { label: "ATELIER", href: "/ar/silhouettes" },
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
            ...(social.whatsappUrl ? [{ label: "واتس آب", href: social.whatsappUrl }] : []),
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
          newsletter: "Bültenimize Abone Olun",
          placeholder: "E-posta adresiniz",
          subscribe: "Abone Ol",
          thanks: "Abone olundu.",
          silhouettes: "Silüetler",
          company: "Şirket",
          support: "Destek",
          legal: "Yasal",
          silhouetteLinks: [
            { label: "ORIGINE", href: sitePaths.silhouettes.TR },
            { label: "MOUVEMENT", href: sitePaths.silhouettes.TR },
            { label: "ÉPURE", href: sitePaths.silhouettes.TR },
            { label: "NOIR", href: sitePaths.silhouettes.TR },
            { label: "HÉRITAGE", href: sitePaths.silhouettes.TR },
            { label: "ATELIER", href: sitePaths.silhouettes.TR },
          ],
          companyLinks: [
            { label: "Hakkımızda", href: sitePaths.about.TR },
            { label: "Hikayemiz", href: sitePaths.story.TR },
            { label: "Sürdürülebilirlik", href: sitePaths.sustainability.TR },
            { label: "Journal", href: sitePaths.journal.TR },
          ],
          supportLinks: [
            { label: "Beden Rehberi", href: sitePaths.sizeGuide.TR },
            { label: "Kargo & İade", href: sitePaths.shippingReturns.TR },
            { label: "İletişim", href: sitePaths.contact.TR },
            ...(social.whatsappUrl ? [{ label: "WhatsApp", href: social.whatsappUrl }] : []),
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

  const socialLinks = [
    { url: social.instagramUrl, icon: <Instagram size={16} />, label: "Instagram" },
    { url: social.facebookUrl, icon: <FacebookIcon size={16} />, label: "Facebook" },
    { url: social.twitterUrl, icon: <Twitter size={16} />, label: "X / Twitter" },
    { url: social.youtubeUrl, icon: <Youtube size={16} />, label: "YouTube" },
    { url: social.tiktokUrl, icon: <TikTokIcon size={16} />, label: "TikTok" },
    { url: social.pinterestUrl, icon: <PinterestIcon size={16} />, label: "Pinterest" },
    { url: social.linkedinUrl, icon: <Linkedin size={16} />, label: "LinkedIn" },
    { url: social.snapchatUrl, icon: <SnapchatIcon size={16} />, label: "Snapchat" },
    { url: social.whatsappUrl, icon: <MessageCircle size={16} />, label: "WhatsApp" },
    { url: social.telegramUrl, icon: <Send size={16} />, label: "Telegram" },
  ].filter(s => s.url);

  return (
    <footer className="bg-[#1C1C1E] text-[#F7F3EC]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Links */}
      <div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-[#F7F3EC]/10">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Silhouettes */}
            <div>
              <h4 className={`font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] mb-4 ${isRTL ? "text-right" : ""}`}>
                {content.silhouettes}
              </h4>
              <ul className={`space-y-2 ${isRTL ? "text-right" : ""}`}>
                {content.silhouetteLinks.map((link) => (
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

            {/* Newsletter — as 5th column, The Row style */}
            <div className={`col-span-2 lg:col-span-1 order-first lg:order-last ${isRTL ? "text-right" : ""}`}>
              <h4 className="font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] mb-4">
                {content.newsletter}
              </h4>
              {subscribed ? (
                <p className="font-body text-sm text-[#F7F3EC]/60 italic">
                  — {content.thanks}
                </p>
              ) : (
                <form onSubmit={handleSubscribe} aria-label={content.newsletter}>
                  <div className={`flex items-center gap-2 border-b border-[#F7F3EC]/20 focus-within:border-[#F7F3EC]/60 transition-colors duration-500 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <input
                      type="email"
                      placeholder={content.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`flex-1 min-w-0 bg-transparent py-2 font-body text-sm text-[#F7F3EC] placeholder-[#F7F3EC]/40 focus:outline-none ${isRTL ? "text-right" : ""}`}
                      required
                      aria-label={content.placeholder}
                    />
                    <button
                      type="submit"
                      aria-label={content.subscribe}
                      className="shrink-0 p-1 text-[#F7F3EC]/50 hover:text-[#F7F3EC] transition-colors duration-500"
                    >
                      {isRTL ? <ArrowLeft size={14} strokeWidth={1} /> : <ArrowRight size={14} strokeWidth={1} />}
                    </button>
                  </div>
                </form>
              )}
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
          {socialLinks.length > 0 && (
            <div className={`flex items-center flex-wrap gap-4 ${isRTL ? "flex-row-reverse justify-end lg:justify-start" : ""}`}>
              {socialLinks.map(({ url, icon, label }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#F7F3EC]/60 hover:text-[#C9A96E] transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#F7F3EC]/10`}>
        <div className={`py-6 text-center ${isRTL ? "text-right" : ""}`}>
          <p className="font-body text-xs text-[#F7F3EC]/40">{content.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
