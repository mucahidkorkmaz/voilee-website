import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { sitePaths } from "@/lib/sitePaths";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_logo_2e68b438.webp";
const HERO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_main-Z5A8u2f2u9H3JoSTeyVYih.webp";

const homeLinks = sitePaths.home;
const loginLinks = sitePaths.login;

const t = {
  TR: {
    title: "Şifremi Unuttum",
    subtitle: "E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.",
    emailLabel: "E-posta Adresi",
    emailPlaceholder: "ornek@email.com",
    submitButton: "Gönder",
    loadingButton: "Gönderiliyor...",
    successMessage: "E-posta gönderildi! Gelen kutunuzu kontrol edin.",
    backToLogin: "Giriş sayfasına dön",
    errorGeneric: "Bir hata oluştu. Lütfen tekrar deneyin.",
    errorEmail: "Lütfen geçerli bir e-posta adresi girin.",
  },
  EN: {
    title: "Forgot Password",
    subtitle: "Enter your email address and we'll send you a reset link.",
    emailLabel: "Email Address",
    emailPlaceholder: "example@email.com",
    submitButton: "Send",
    loadingButton: "Sending...",
    successMessage: "Email sent! Please check your inbox.",
    backToLogin: "Back to login",
    errorGeneric: "Something went wrong. Please try again.",
    errorEmail: "Please enter a valid email address.",
  },
  AR: {
    title: "نسيت كلمة المرور",
    subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "example@email.com",
    submitButton: "إرسال",
    loadingButton: "جارٍ الإرسال...",
    successMessage: "تم إرسال البريد الإلكتروني! تحقق من صندوق الوارد.",
    backToLogin: "العودة إلى تسجيل الدخول",
    errorGeneric: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    errorEmail: "يرجى إدخال بريد إلكتروني صحيح.",
  },
} as const;

export default function ForgotPassword() {
  const { lang, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const text = t[lang as keyof typeof t] ?? t.TR;
  const homeLink = homeLinks[lang as keyof typeof homeLinks] ?? homeLinks.TR;
  const loginLink = loginLinks[lang as keyof typeof loginLinks] ?? loginLinks.TR;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) { toast.error(text.errorEmail); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data?.message ?? text.errorGeneric); }
      setSubmitted(true);
      toast.success(text.successMessage);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : text.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7F3EC]" dir={isRTL ? "rtl" : "ltr"}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={HERO_URL} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/70 via-[#1C1C1E]/20 to-transparent" />
        <Link href={homeLink} className="absolute top-8 left-8 z-10">
          <img src={LOGO_URL} alt="Logo" className="h-8 w-auto" />
        </Link>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-[#F7F3EC]">
        <div className="flex lg:hidden justify-center mb-8">
          <Link href={homeLink}><img src={LOGO_URL} alt="Logo" className="h-8 w-auto" /></Link>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-2xl md:text-3xl text-[#1C1C1E] mb-2">{text.title}</h1>
          <p className="font-body text-sm text-[#1C1C1E]/60 mb-8">{text.subtitle}</p>
          {submitted ? (
            <div className="rounded-lg border border-[#C9A96E]/40 bg-[#F7F3EC] px-5 py-4 text-sm font-body text-[#1C1C1E] mb-6">
              {text.successMessage}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="email" className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-2">{text.emailLabel}</label>
                <input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={text.emailPlaceholder} disabled={loading} className="w-full bg-transparent border-0 border-b border-[#1C1C1E]/20 px-0 py-2.5 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none focus:border-[#C9A96E] disabled:opacity-50 transition-colors" />
              </div>
              <button type="submit" disabled={loading || !email} className="w-full inline-flex items-center justify-center bg-[#1C1C1E] text-[#F7F3EC] font-body text-xs tracking-[0.25em] uppercase py-3.5 hover:bg-[#C9A96E] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none">
                {loading ? text.loadingButton : text.submitButton}
              </button>
            </form>
          )}
          <p className="mt-6 text-center font-body text-sm text-[#1C1C1E]/60">
            <Link href={loginLink} className="text-[#C9A96E] hover:underline underline-offset-4 font-medium">← {text.backToLogin}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
