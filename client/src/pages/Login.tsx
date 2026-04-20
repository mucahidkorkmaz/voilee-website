import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { sitePaths } from "@/lib/sitePaths";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_logo_2e68b438.webp";
const HERO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663539077798/3fydJdkTrUbQF5VyRYKBGS/voilee_hero_main-Z5A8u2f2u9H3JoSTeyVYih.webp";

const t = {
  TR: {
    backHome: "Ana Sayfaya Dön",
    overline: "Hoş Geldiniz",
    title: "Hesabıma Giriş",
    subtitle: "Devam etmek için hesabınıza giriş yapın",
    quote: "Zarafet, içeride başlar.",
    studio: "Voilée Studio",
    email: "E-posta",
    password: "Şifre",
    remember: "Beni hatırla",
    forgot: "Şifremi unuttum",
    submit: "Giriş Yap",
    submitting: "Giriş yapılıyor...",
    noAccount: "Hesabınız yok mu?",
    register: "Üye Ol",
    successToast: "Hoş geldiniz!",
  },
  EN: {
    backHome: "Back to Home",
    overline: "Welcome",
    title: "Sign In to Your Account",
    subtitle: "Please sign in to continue",
    quote: "Elegance begins from within.",
    studio: "Voilée Studio",
    email: "Email",
    password: "Password",
    remember: "Remember me",
    forgot: "Forgot password",
    submit: "Sign In",
    submitting: "Signing in...",
    noAccount: "Don't have an account?",
    register: "Sign Up",
    successToast: "Welcome back!",
  },
  AR: {
    backHome: "العودة إلى الصفحة الرئيسية",
    overline: "مرحباً",
    title: "تسجيل الدخول إلى حسابك",
    subtitle: "يرجى تسجيل الدخول للمتابعة",
    quote: "الأناقة تبدأ من الداخل.",
    studio: "استوديو فوالييه",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    remember: "تذكرني",
    forgot: "نسيت كلمة المرور",
    submit: "تسجيل الدخول",
    submitting: "جارٍ تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    register: "إنشاء حساب",
    successToast: "أهلاً بعودتك!",
  },
};

const homeLinks = sitePaths.home;
const registerLinks = sitePaths.register;
const forgotLinks = sitePaths.forgotPassword;

function getRedirectAfterLogin(lang: "TR" | "EN" | "AR") {
  if (typeof window === "undefined") return homeLinks[lang];
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (redirect && redirect.startsWith("/")) return redirect;
  return homeLinks[lang];
}

export default function Login() {
  const { lang, isRTL } = useLanguage();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const tx = t[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success(tx.successToast);
      setLocation(getRedirectAfterLogin(lang));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row bg-[#F7F3EC]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Sol: Editorial görsel */}
      <div className="lg:w-3/5 h-56 lg:h-screen relative overflow-hidden">
        <img
          src={HERO_URL}
          alt="Voilée"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/70 via-[#1C1C1E]/20 to-transparent" />
        <Link
          href={homeLinks[lang]}
          className="absolute top-6 left-6 lg:top-10 lg:left-10 inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-white/80 hover:text-[#C9A96E] transition-colors"
        >
          <ChevronLeft size={14} className={isRTL ? "rotate-180" : ""} />
          {tx.backHome}
        </Link>
        <div className="hidden lg:block absolute bottom-12 left-12 max-w-md">
          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">
            {tx.studio}
          </p>
          <p className="font-display text-4xl text-white leading-tight">
            "{tx.quote}"
          </p>
          <span className="block mt-6 w-12 h-px bg-[#C9A96E]" />
        </div>
      </div>

      {/* Sağ: Form */}
      <div className="lg:w-2/5 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm">
          <Link href={homeLinks[lang]}>
            <img
              src={LOGO_URL}
              alt="VOILÉE"
              className="h-10 w-auto mx-auto mb-12 object-contain"
            />
          </Link>

          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] text-center mb-3">
            {tx.overline}
          </p>
          <h1 className="font-display text-4xl text-[#1C1C1E] text-center mb-3 leading-tight">
            {tx.title}
          </h1>
          <p className="font-body text-sm text-[#1C1C1E]/60 text-center mb-10">
            {tx.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email */}
            <div>
              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-2">
                {tx.email}
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#1C1C1E]/20 px-0 py-2.5 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none focus:border-[#C9A96E] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-2">
                {tx.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-transparent border-0 border-b border-[#1C1C1E]/20 px-0 py-2.5 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none focus:border-[#C9A96E] transition-colors ${
                    isRTL ? "pl-8" : "pr-8"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 text-[#1C1C1E]/40 hover:text-[#C9A96E] transition-colors ${
                    isRTL ? "left-0" : "right-0"
                  }`}
                  aria-label={showPassword ? "hide" : "show"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between gap-4">
              <label className="inline-flex items-center gap-2 font-body text-xs text-[#1C1C1E]/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#C9A96E] cursor-pointer"
                />
                {tx.remember}
              </label>
              <Link href={forgotLinks[lang]}
                className="font-body text-xs text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors"
              >
                {tx.forgot}
              </Link>
            </div>

            {error && (
              <p className="font-body text-xs text-red-500 text-center -mt-1">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1C1C1E] text-[#F7F3EC] font-body text-xs tracking-[0.25em] uppercase py-3.5 hover:bg-[#C9A96E] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? tx.submitting : tx.submit}
            </button>
          </form>

          <p className="text-center mt-10 font-body text-sm text-[#1C1C1E]/60">
            {tx.noAccount}{" "}
            <Link
              href={registerLinks[lang]}
              className="text-[#C9A96E] underline-offset-4 hover:underline font-medium"
            >
              {tx.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
