import { useState, useEffect } from "react";
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
    title: "Yeni Şifre Belirle",
    subtitle: "Hesabınız için yeni bir şifre oluşturun.",
    passwordLabel: "Yeni Şifre",
    passwordPlaceholder: "En az 8 karakter",
    confirmLabel: "Şifre Tekrar",
    confirmPlaceholder: "Şifreyi tekrar girin",
    submitButton: "Şifreyi Sıfırla",
    loadingButton: "Sıfırlanıyor...",
    successMessage: "Şifreniz başarıyla sıfırlandı! Giriş yapabilirsiniz.",
    backToLogin: "Giriş sayfasına dön",
    errorGeneric: "Bir hata oluştu. Lütfen tekrar deneyin.",
    errorPasswordLength: "Şifre en az 8 karakter olmalıdır.",
    errorPasswordMatch: "Şifreler eşleşmiyor.",
    errorTokenMissing: "Geçersiz veya eksik sıfırlama bağlantısı.",
    errorTokenExpired: "Sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
    showPassword: "Şifreyi göster",
    hidePassword: "Şifreyi gizle",
  },
  EN: {
    title: "Set New Password",
    subtitle: "Create a new password for your account.",
    passwordLabel: "New Password",
    passwordPlaceholder: "At least 8 characters",
    confirmLabel: "Confirm Password",
    confirmPlaceholder: "Re-enter your password",
    submitButton: "Reset Password",
    loadingButton: "Resetting...",
    successMessage: "Password reset successfully! You can now log in.",
    backToLogin: "Back to login",
    errorGeneric: "Something went wrong. Please try again.",
    errorPasswordLength: "Password must be at least 8 characters.",
    errorPasswordMatch: "Passwords do not match.",
    errorTokenMissing: "Invalid or missing reset link.",
    errorTokenExpired: "Reset link is invalid or has expired.",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  AR: {
    title: "تعيين كلمة مرور جديدة",
    subtitle: "أنشئ كلمة مرور جديدة لحسابك.",
    passwordLabel: "كلمة المرور الجديدة",
    passwordPlaceholder: "8 أحرف على الأقل",
    confirmLabel: "تأكيد كلمة المرور",
    confirmPlaceholder: "أعد إدخال كلمة المرور",
    submitButton: "إعادة تعيين كلمة المرور",
    loadingButton: "جارٍ إعادة التعيين...",
    successMessage: "تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.",
    backToLogin: "العودة إلى تسجيل الدخول",
    errorGeneric: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    errorPasswordLength: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    errorPasswordMatch: "كلمتا المرور غير متطابقتين.",
    errorTokenMissing: "رابط إعادة التعيين غير صالح أو مفقود.",
    errorTokenExpired: "رابط إعادة التعيين غير صالح أو انتهت صلاحيته.",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
  },
} as const;

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1={2} y1={2} x2={22} y2={22} />
    </svg>
  );
}

export default function ResetPassword() {
  const { lang, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const text = t[lang as keyof typeof t] ?? t.TR;
  const homeLink = homeLinks[lang as keyof typeof homeLinks] ?? homeLinks.TR;
  const loginLink = loginLinks[lang as keyof typeof loginLinks] ?? loginLinks.TR;

  const [token] = useState<string | null>(() => new URLSearchParams(window.location.search).get("token"));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) toast.error(text.errorTokenMissing);
  }, [token, text.errorTokenMissing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error(text.errorTokenMissing); return; }
    if (password.length < 8) { toast.error(text.errorPasswordLength); return; }
    if (password !== confirmPassword) { toast.error(text.errorPasswordMatch); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? (res.status === 400 ? text.errorTokenExpired : text.errorGeneric));
      }
      toast.success(text.successMessage);
      setTimeout(() => setLocation(loginLink), 1500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : text.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? "rtl" : "ltr"}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img src={HERO_URL} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/10" />
        <Link href={homeLink} className="absolute top-8 left-8 z-10">
          <img src={LOGO_URL} alt="Logo" className="h-8 w-auto" />
        </Link>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white dark:bg-gray-950">
        <div className="flex lg:hidden justify-center mb-8">
          <Link href={homeLink}><img src={LOGO_URL} alt="Logo" className="h-8 w-auto" /></Link>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">{text.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{text.subtitle}</p>
          {!token ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 mb-6">{text.errorTokenMissing}</div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{text.passwordLabel}</label>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder={text.passwordPlaceholder} disabled={loading} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 transition" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className={`absolute inset-y-0 ${isRTL ? "left-3" : "right-3"} flex items-center text-gray-400 hover:text-gray-600 transition`}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{text.confirmLabel}</label>
                <div className="relative">
                  <input id="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={text.confirmPlaceholder} disabled={loading} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 transition" />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)} className={`absolute inset-y-0 ${isRTL ? "left-3" : "right-3"} flex items-center text-gray-400 hover:text-gray-600 transition`}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || !password || !confirmPassword} className="w-full rounded-lg bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2.5 transition-colors focus:outline-none disabled:cursor-not-allowed">
                {loading ? text.loadingButton : text.submitButton}
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href={loginLink} className="font-medium text-gray-900 dark:text-white hover:underline">← {text.backToLogin}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
