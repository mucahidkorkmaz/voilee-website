import { useEffect, useState } from "react";
import {
  Pencil,
  Check,
  X as XIcon,
  Loader2,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronRight,
  FileText,
} from "lucide-react";
import AccountLayout from "../layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    overline: "Bilgilerim",
    profileTitle: "Profil Bilgileri",
    profileSubtitle: "Ad, telefon ve hesap bilgilerinizi güncelleyin.",
    name: "Ad Soyad",
    email: "E-posta",
    phone: "Telefon",
    role: "Rol",
    member: "Voilée Üyesi",
    notProvided: "—",
    verified: "Doğrulanmış e-posta",
    notVerified: "E-posta doğrulanmamış",
    edit: "Düzenle",
    save: "Kaydet",
    cancel: "İptal",
    saving: "Kaydediliyor...",
    profileSaved: "Profil bilgileri güncellendi.",
    changePassword: {
      title: "Parola Değiştir",
      subtitle: "Hesabınızı güvende tutmak için parolanızı düzenli olarak güncelleyin.",
      current: "Mevcut Parola",
      newPass: "Yeni Parola",
      confirm: "Yeni Parolayı Onayla",
      submit: "Parolayı Güncelle",
      submitting: "Güncelleniyor...",
      success: "Parolanız başarıyla güncellendi.",
      mismatch: "Yeni parolalar eşleşmiyor.",
      tooShort: "Yeni parola en az 8 karakter olmalıdır.",
    },
    kvkk: {
      title: "Gizlilik & KVKK",
      subtitle: "Kişisel verilerinizin nasıl işlendiğini öğrenin ve tercihlerinizi yönetin.",
      marketing: "Pazarlama iletişimleri",
      marketingDesc: "Kampanya, yeni silüetler ve özel teklifler hakkında e-posta almak istiyorum.",
      analytics: "Kişiselleştirme",
      analyticsDesc: "Deneyimimi geliştirmek için kullanım verilerimin analiz edilmesine izin veriyorum.",
      policyLink: "Gizlilik Politikası & KVKK Metni",
      saved: "Gizlilik tercihleri kaydedildi.",
    },
  },
  EN: {
    overline: "My Details",
    profileTitle: "Profile Info",
    profileSubtitle: "Update your name, phone and account information.",
    name: "Full Name",
    email: "Email",
    phone: "Phone",
    role: "Role",
    member: "Voilée Member",
    notProvided: "—",
    verified: "Verified email",
    notVerified: "Email not verified",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving...",
    profileSaved: "Profile updated successfully.",
    changePassword: {
      title: "Change Password",
      subtitle: "Keep your account secure by updating your password regularly.",
      current: "Current Password",
      newPass: "New Password",
      confirm: "Confirm New Password",
      submit: "Update Password",
      submitting: "Updating...",
      success: "Your password has been updated successfully.",
      mismatch: "New passwords do not match.",
      tooShort: "New password must be at least 8 characters.",
    },
    kvkk: {
      title: "Privacy & Data",
      subtitle: "Learn how your personal data is processed and manage your preferences.",
      marketing: "Marketing communications",
      marketingDesc: "I want to receive emails about campaigns, new silhouettes and special offers.",
      analytics: "Personalization",
      analyticsDesc: "I allow my usage data to be analysed to improve my experience.",
      policyLink: "Privacy Policy & Data Processing Notice",
      saved: "Privacy preferences saved.",
    },
  },
  AR: {
    overline: "معلوماتي",
    profileTitle: "معلومات الملف الشخصي",
    profileSubtitle: "حدّث اسمك ورقم هاتفك ومعلومات حسابك.",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    role: "الدور",
    member: "عضو فوالييه",
    notProvided: "—",
    verified: "بريد إلكتروني موثّق",
    notVerified: "البريد الإلكتروني غير موثّق",
    edit: "تعديل",
    save: "حفظ",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ...",
    profileSaved: "تم تحديث الملف الشخصي.",
    changePassword: {
      title: "تغيير كلمة المرور",
      subtitle: "حافظ على أمان حسابك بتحديث كلمة المرور بانتظام.",
      current: "كلمة المرور الحالية",
      newPass: "كلمة المرور الجديدة",
      confirm: "تأكيد كلمة المرور الجديدة",
      submit: "تحديث كلمة المرور",
      submitting: "جارٍ التحديث...",
      success: "تم تحديث كلمة المرور بنجاح.",
      mismatch: "كلمتا المرور الجديدتان غير متطابقتين.",
      tooShort: "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.",
    },
    kvkk: {
      title: "الخصوصية والبيانات",
      subtitle: "تعرّف على كيفية معالجة بياناتك الشخصية وأدر تفضيلاتك.",
      marketing: "اتصالات تسويقية",
      marketingDesc: "أريد تلقّي رسائل إلكترونية حول الحملات والصور الظلية والعروض الخاصة.",
      analytics: "التخصيص",
      analyticsDesc: "أسمح بتحليل بيانات استخدامي لتحسين تجربتي.",
      policyLink: "سياسة الخصوصية وإشعار معالجة البيانات",
      saved: "تم حفظ تفضيلات الخصوصية.",
    },
  },
};

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BilgilerPage() {
  const { lang, isRTL } = useLanguage();
  const { user, updateProfile } = useAuth();
  const tx = t[lang];

  if (!user) return null;

  return (
    <AccountLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
          {tx.overline}
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile section */}
        <ProfileSection user={user} tx={tx} updateProfile={updateProfile} isRTL={isRTL} />

        {/* KVKK / Privacy section */}
        <KvkkSection tx={tx.kvkk} isRTL={isRTL} />

        {/* Change password section */}
        <ChangePasswordSection tx={tx.changePassword} isRTL={isRTL} />
      </div>
    </AccountLayout>
  );
}

// ─── Profile Section ────────────────────────────────────────────────────────────

function ProfileSection({
  user,
  tx,
  updateProfile,
  isRTL,
}: {
  user: { name: string | null; email: string | null; phone: string | null; role: string; emailVerified: boolean };
  tx: (typeof t)[keyof typeof t];
  updateProfile: (p: { name?: string; phone?: string | null }) => Promise<unknown>;
  isRTL: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user, editing]);

  const handleCancel = () => {
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setError(null);
    setEditing(false);
  };

  const handleSave = async () => {
    if (name.trim().length < 2) {
      setError(tx.name + " en az 2 karakter olmalıdır.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || null });
      toast.success(tx.profileSaved);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white border border-[#C9A96E]/15 p-6 lg:p-8">
      <div
        className={`flex items-center justify-between mb-6 pb-5 border-b border-[#C9A96E]/15 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div className={`flex items-center gap-3 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
          <h2 className="font-display text-xl text-[#1C1C1E]">
            {tx.profileTitle}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 font-body text-[10px] tracking-[0.18em] uppercase ${
              user.emailVerified ? "text-emerald-600" : "text-[#1C1C1E]/40"
            }`}
          >
            <ShieldCheck size={13} />
            {user.emailVerified ? tx.verified : tx.notVerified}
          </span>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Pencil size={13} />
            {tx.edit}
          </button>
        ) : (
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              type="button"
              onClick={handleCancel}
              className={`inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 hover:text-[#1C1C1E] transition-colors ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <XIcon size={13} />
              {tx.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-4 py-2 hover:bg-[#C9A96E] transition-colors disabled:opacity-50 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {isSaving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              {isSaving ? tx.saving : tx.save}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mb-5 font-body text-xs text-red-500">{error}</p>
      )}

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <ProfileField
          label={tx.name}
          value={name}
          editing={editing}
          onChange={setName}
          autoComplete="name"
        />
        <ProfileField
          label={tx.email}
          value={user.email ?? tx.notProvided}
          editing={false}
        />
        <ProfileField
          label={tx.phone}
          value={phone}
          editing={editing}
          onChange={setPhone}
          type="tel"
          placeholder={tx.notProvided}
          autoComplete="tel"
        />
        <ProfileField
          label={tx.role}
          value={user.role === "admin" ? "Admin" : tx.member}
          editing={false}
        />
      </div>
    </section>
  );
}

function ProfileField({
  label,
  value,
  editing,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/45 mb-2">
        {label}
      </label>
      {editing && onChange ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent border-0 border-b border-[#C9A96E] px-0 py-2 font-body text-base text-[#1C1C1E] focus:outline-none transition-colors"
        />
      ) : (
        <p className="font-body text-base text-[#1C1C1E] py-2 border-b border-[#1C1C1E]/10 break-words">
          {value || placeholder || "—"}
        </p>
      )}
    </div>
  );
}

// ─── KVKK / Privacy Section ─────────────────────────────────────────────────────

function KvkkSection({
  tx,
  isRTL,
}: {
  tx: (typeof t)[keyof typeof t]["kvkk"];
  isRTL: boolean;
}) {
  const [marketing, setMarketing] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const handleSave = () => {
    toast.success(tx.saved);
    setExpanded(false);
  };

  return (
    <section
      className="bg-white border border-[#C9A96E]/15 p-6 lg:p-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <FileText
            size={18}
            className="text-[#C9A96E] flex-shrink-0"
          />
          <div className={isRTL ? "text-right" : "text-left"}>
            <h2 className="font-display text-xl text-[#1C1C1E]">{tx.title}</h2>
            <p className="font-body text-xs text-[#1C1C1E]/50 mt-0.5">
              {tx.subtitle}
            </p>
          </div>
        </div>
        <ChevronRight
          size={18}
          className={`text-[#C9A96E] transition-transform duration-300 flex-shrink-0 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-7 pt-5 border-t border-[#C9A96E]/15 space-y-5">
          {/* Marketing toggle */}
          <ConsentRow
            label={tx.marketing}
            desc={tx.marketingDesc}
            checked={marketing}
            onChange={setMarketing}
            isRTL={isRTL}
          />

          {/* Analytics toggle */}
          <ConsentRow
            label={tx.analytics}
            desc={tx.analyticsDesc}
            checked={analytics}
            onChange={setAnalytics}
            isRTL={isRTL}
          />

          {/* Policy link */}
          <a
            href="#"
            className={`inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.15em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <FileText size={13} />
            {tx.policyLink}
          </a>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-7 py-3 hover:bg-[#C9A96E] transition-colors"
          >
            <Check size={13} />
            {tx.saved.split(".")[0]}
          </button>
        </div>
      )}
    </section>
  );
}

function ConsentRow({
  label,
  desc,
  checked,
  onChange,
  isRTL,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  isRTL: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
    >
      <div className="flex-1">
        <p className="font-body text-sm text-[#1C1C1E] font-medium">{label}</p>
        <p className="font-body text-xs text-[#1C1C1E]/55 mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 mt-0.5 ${
          checked ? "bg-[#C9A96E]" : "bg-[#1C1C1E]/15"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Change Password Section ────────────────────────────────────────────────────

type CpTx = (typeof t)[keyof typeof t]["changePassword"];

function ChangePasswordSection({
  tx,
  isRTL,
}: {
  tx: CpTx;
  isRTL: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError(tx.tooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(tx.mismatch);
      return;
    }
    setIsSubmitting(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      toast.success(tx.success);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="bg-white border border-[#C9A96E]/15 p-6 lg:p-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <KeyRound size={18} className="text-[#C9A96E] flex-shrink-0" />
          <div className={isRTL ? "text-right" : "text-left"}>
            <h2 className="font-display text-xl text-[#1C1C1E]">{tx.title}</h2>
            <p className="font-body text-xs text-[#1C1C1E]/50 mt-0.5">
              {tx.subtitle}
            </p>
          </div>
        </div>
        <ChevronRight
          size={18}
          className={`text-[#C9A96E] transition-transform duration-300 flex-shrink-0 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {expanded && (
        <form
          onSubmit={handleSubmit}
          className="max-w-md space-y-6 mt-7 pt-5 border-t border-[#C9A96E]/15"
        >
          <PasswordField
            label={tx.current}
            value={currentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            onChange={setCurrentPassword}
            isRTL={isRTL}
          />
          <PasswordField
            label={tx.newPass}
            value={newPassword}
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
            onChange={setNewPassword}
            isRTL={isRTL}
          />
          <PasswordField
            label={tx.confirm}
            value={confirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            onChange={setConfirmPassword}
            isRTL={isRTL}
          />
          {error && (
            <p className="font-body text-xs text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-8 py-3.5 hover:bg-[#C9A96E] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <Loader2 size={13} className="animate-spin" />
            )}
            {isSubmitting ? tx.submitting : tx.submit}
          </button>
        </form>
      )}
    </section>
  );
}

function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
  isRTL,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  isRTL: boolean;
}) {
  return (
    <div>
      <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-transparent border-0 border-b border-[#1C1C1E]/20 px-0 py-2.5 font-body text-sm text-[#1C1C1E] focus:outline-none focus:border-[#C9A96E] transition-colors ${
            isRTL ? "pl-8" : "pr-8"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className={`absolute top-1/2 -translate-y-1/2 text-[#1C1C1E]/40 hover:text-[#C9A96E] transition-colors ${
            isRTL ? "left-0" : "right-0"
          }`}
          aria-label={show ? "hide" : "show"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
