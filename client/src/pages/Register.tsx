import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, ChevronLeft, Check } from "lucide-react";
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
    overline: "Aramıza Katılın",
    title: "Üye Ol",
    subtitle: "Voilée dünyasına ilk adım",
    quote: "Her detay özenle dokunmuş.",
    studio: "Voilée Studio",
    name: "Ad Soyad",
    email: "E-posta",
    phone: "Telefon (opsiyonel)",
    password: "Şifre",
    passwordHint: "En az 8 karakter",
    passwordConfirm: "Şifre Tekrar",
    terms: "KVKK Aydınlatma Metni'ni okudum ve onaylıyorum.",
    submit: "Hesabımı Oluştur",
    submitting: "Oluşturuluyor...",
    haveAccount: "Hesabınız var mı?",
    login: "Giriş Yap",
    successToast: "Hesabınız oluşturuldu. Hoş geldiniz!",
    errPwMatch: "Şifreler eşleşmiyor.",
    errTerms: "Devam etmek için aydınlatma metnini onaylamanız gerekir.",
  },
  EN: {
    backHome: "Back to Home",
    overline: "Join Us",
    title: "Create Account",
    subtitle: "Your first step into the Voilée world",
    quote: "Every detail, woven with care.",
    studio: "Voilée Studio",
    name: "Full Name",
    email: "Email",
    phone: "Phone (optional)",
    password: "Password",
    passwordHint: "At least 8 characters",
    passwordConfirm: "Confirm Password",
    terms: "I have read and accept the Privacy Policy.",
    submit: "Create My Account",
    submitting: "Creating...",
    haveAccount: "Already have an account?",
    login: "Sign In",
    successToast: "Account created. Welcome!",
    errPwMatch: "Passwords do not match.",
    errTerms: "Please accept the privacy policy to continue.",
  },
  AR: {
    backHome: "العودة إلى الصفحة الرئيسية",
    overline: "انضم إلينا",
    title: "إنشاء حساب",
    subtitle: "خطوتك الأولى إلى عالم فوالييه",
    quote: "كل تفصيل، منسوج بعناية.",
    studio: "استوديو فوالييه",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف (اختياري)",
    password: "كلمة المرور",
    passwordHint: "8 أحرف على الأقل",
    passwordConfirm: "تأكيد كلمة المرور",
    terms: "لقد قرأت وأوافق على سياسة الخصوصية.",
    submit: "إنشاء حسابي",
    submitting: "جارٍ الإنشاء...",
    haveAccount: "هل لديك حساب؟",
    login: "تسجيل الدخول",
    successToast: "تم إنشاء الحساب. مرحباً!",
    errPwMatch: "كلمات المرور غير متطابقة.",
    errTerms: "يرجى قبول سياسة الخصوصية للمتابعة.",
  },
};

const homeLinks = sitePaths.home;
const loginLinks = sitePaths.login;

export default function Register() {
  const { lang, isRTL } = useLanguage();
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const tx = t[lang];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (password !== passwordConfirm) {
      setError(tx.errPwMatch);
      return;
    }
    if (!acceptTerms) {
      setError(tx.errTerms);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      toast.success(tx.successToast);
      setLocation(homeLinks[lang]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const underlineInput = `w-full bg-transparent border-0 border-b border-[#1C1C1E]/20 px-0 py-2.5 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none focus:border-[#C9A96E] transition-colors`;

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row bg-[#F7F3EC]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Sol: Editorial görsel */}
      <div className="lg:w-3/5 h-56 lg:h-screen relative overflow-hidden order-1 lg:order-2">
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
      <div className="lg:w-2/5 flex items-center justify-center p-8 lg:p-16 order-2 lg:order-1">
        <div className="w-full max-w-sm">
          <Link href={homeLinks[lang]}>
            <img
              src={LOGO_URL}
              alt="VOILÉE"
              className="h-10 w-auto mx-auto mb-10 object-contain"
            />
          </Link>

          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] text-center mb-3">
            {tx.overline}
          </p>
          <h1 className="font-display text-4xl text-[#1C1C1E] text-center mb-3 leading-tight">
            {tx.title}
          </h1>
          <p className="font-body text-sm text-[#1C1C1E]/60 text-center mb-8">
            {tx.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-2">
                {tx.name}
              </label>
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={underlineInput}
              />
            </div>

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
                className={underlineInput}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-2">
                {tx.phone}
              </label>
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={underlineInput}
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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${underlineInput} ${isRTL ? "pl-8" : "pr-8"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 text-[#1C1C1E]/40 hover:text-[#C9A96E] transition-colors ${
                    isRTL ? "left-0" : "right-0"
                  }`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1.5 font-body text-[10px] text-[#1C1C1E]/40 tracking-wide">
                {tx.passwordHint}
              </p>
            </div>

            {/* Password confirm */}
            <div>
              <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-2">
                {tx.passwordConfirm}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={underlineInput}
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <span
                className={`mt-0.5 flex-shrink-0 w-4 h-4 border transition-colors ${
                  acceptTerms
                    ? "bg-[#C9A96E] border-[#C9A96E]"
                    : "border-[#1C1C1E]/30 group-hover:border-[#C9A96E]"
                } flex items-center justify-center`}
              >
                {acceptTerms && <Check size={11} className="text-white" strokeWidth={3} />}
              </span>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="sr-only"
              />
              <span className="font-body text-xs text-[#1C1C1E]/60 leading-relaxed">
                {tx.terms}
              </span>
            </label>

            {error && (
              <p className="font-body text-xs text-red-500 text-center">{error}</p>
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

          <p className="text-center mt-8 font-body text-sm text-[#1C1C1E]/60">
            {tx.haveAccount}{" "}
            <Link
              href={loginLinks[lang]}
              className="text-[#C9A96E] underline-offset-4 hover:underline font-medium"
            >
              {tx.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
