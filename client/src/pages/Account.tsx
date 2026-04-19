import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  User as UserIcon,
  Heart,
  Package,
  ChevronRight,
  LogOut,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Check,
  X as XIcon,
  MapPin,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useAddress, type SavedAddress, emptyAddress } from "@/contexts/AddressContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ─── Translations ──────────────────────────────────────────────────────────────

const t = {
  TR: {
    overline: "Hesabım",
    welcome: "Hoş geldiniz",
    subtitle: "Profilinizi, favorilerinizi ve siparişlerinizi tek bir yerden yönetin.",
    member: "Voilée Üyesi",
    verified: "Doğrulanmış e-posta",
    notVerified: "E-posta doğrulanmamış",
    profile: { title: "Hesabım", desc: "Kişisel bilgilerinizi görüntüleyin ve hesap detaylarınızı yönetin." },
    favorites: { title: "Favorilerim", desc: "Beğendiğiniz parçaları daha sonra incelemek için kaydedin.", countOne: "ürün", countMany: "ürün" },
    orders: { title: "Siparişlerim", desc: "Sipariş geçmişinizi ve teslimat durumunu takip edin.", countOne: "sipariş", countMany: "sipariş" },
    quickAccess: "Kısayollar",
    profileTitle: "Profil Bilgileri",
    name: "Ad Soyad", email: "E-posta", phone: "Telefon", role: "Rol",
    notProvided: "—",
    logout: "Çıkış Yap",
    loginRequired: "Bu sayfayı görüntülemek için giriş yapmanız gerekir.",
    loggedOut: "Çıkış yapıldı.",
    edit: "Düzenle", save: "Kaydet", cancel: "İptal", saving: "Kaydediliyor...",
    profileSaved: "Profil bilgileri güncellendi.",
    // address
    addressTitle: "Adreslerim",
    addressSubtitle: "Kayıtlı adreslerinizi yönetin. Varsayılan adres siparişlerde otomatik kullanılır.",
    addAddress: "Yeni Adres Ekle",
    addressSaved: "Adres kaydedildi.",
    addressUpdated: "Adres güncellendi.",
    addressDeleted: "Adres silindi.",
    defaultSet: "Varsayılan adres güncellendi.",
    setDefault: "Varsayılan Yap",
    defaultBadge: "Varsayılan",
    noAddress: "Kayıtlı adres yok.",
    noAddressDesc: "Teslimat bilgilerinizi kaydedin, bir sonraki siparişinizde otomatik doldurulsun.",
    labelPlaceholder: "Adres etiketi (ör. Ev, İş)",
    label: "Adres Etiketi",
    fullName: "Ad Soyad", addressPhone: "Telefon", addressLine: "Adres",
    addressLinePlaceholder: "Sokak, bina no, daire no",
    city: "Şehir", district: "İlçe", postalCode: "Posta Kodu", country: "Ülke",
    makeDefault: "Varsayılan olarak kaydet",
    changePassword: {
      title: "Parola Değiştir",
      subtitle: "Hesabınızı güvende tutmak için parolanızı düzenli olarak güncelleyin.",
      current: "Mevcut Parola", newPass: "Yeni Parola", confirm: "Yeni Parolayı Onayla",
      submit: "Parolayı Güncelle", submitting: "Güncelleniyor...",
      success: "Parolanız başarıyla güncellendi.",
      mismatch: "Yeni parolalar eşleşmiyor.",
      tooShort: "Yeni parola en az 8 karakter olmalıdır.",
    },
  },
  EN: {
    overline: "My Account",
    welcome: "Welcome",
    subtitle: "Manage your profile, favorites and orders from one place.",
    member: "Voilée Member",
    verified: "Verified email",
    notVerified: "Email not verified",
    profile: { title: "My Account", desc: "View your personal information and manage account details." },
    favorites: { title: "My Favorites", desc: "Save the pieces you love to revisit later.", countOne: "item", countMany: "items" },
    orders: { title: "My Orders", desc: "Track your order history and delivery status.", countOne: "order", countMany: "orders" },
    quickAccess: "Shortcuts",
    profileTitle: "Profile Details",
    name: "Full Name", email: "Email", phone: "Phone", role: "Role",
    notProvided: "—",
    logout: "Sign Out",
    loginRequired: "Please sign in to view this page.",
    loggedOut: "Signed out.",
    edit: "Edit", save: "Save", cancel: "Cancel", saving: "Saving...",
    profileSaved: "Profile updated successfully.",
    addressTitle: "My Addresses",
    addressSubtitle: "Manage your saved addresses. The default address is auto-filled at checkout.",
    addAddress: "Add New Address",
    addressSaved: "Address saved.",
    addressUpdated: "Address updated.",
    addressDeleted: "Address removed.",
    defaultSet: "Default address updated.",
    setDefault: "Set as Default",
    defaultBadge: "Default",
    noAddress: "No saved addresses.",
    noAddressDesc: "Save your delivery info to have it auto-filled on your next order.",
    labelPlaceholder: "Address label (e.g. Home, Work)",
    label: "Label",
    fullName: "Full Name", addressPhone: "Phone", addressLine: "Address",
    addressLinePlaceholder: "Street, building no, apt no",
    city: "City", district: "District", postalCode: "Postal Code", country: "Country",
    makeDefault: "Save as default",
    changePassword: {
      title: "Change Password",
      subtitle: "Keep your account secure by updating your password regularly.",
      current: "Current Password", newPass: "New Password", confirm: "Confirm New Password",
      submit: "Update Password", submitting: "Updating...",
      success: "Your password has been updated successfully.",
      mismatch: "New passwords do not match.",
      tooShort: "New password must be at least 8 characters.",
    },
  },
  AR: {
    overline: "حسابي",
    welcome: "أهلاً بك",
    subtitle: "أدر ملفك الشخصي ومفضلاتك وطلباتك من مكان واحد.",
    member: "عضو فوالييه",
    verified: "بريد إلكتروني موثّق",
    notVerified: "البريد الإلكتروني غير موثّق",
    profile: { title: "حسابي", desc: "اعرض بياناتك الشخصية وأدر تفاصيل حسابك." },
    favorites: { title: "مفضلاتي", desc: "احفظ القطع التي تحبها لمراجعتها لاحقاً.", countOne: "منتج", countMany: "منتجات" },
    orders: { title: "طلباتي", desc: "تابع سجل طلباتك وحالة التوصيل.", countOne: "طلب", countMany: "طلبات" },
    quickAccess: "اختصارات",
    profileTitle: "بيانات الملف الشخصي",
    name: "الاسم الكامل", email: "البريد الإلكتروني", phone: "الهاتف", role: "الدور",
    notProvided: "—",
    logout: "تسجيل الخروج",
    loginRequired: "يرجى تسجيل الدخول لعرض هذه الصفحة.",
    loggedOut: "تم تسجيل الخروج.",
    edit: "تعديل", save: "حفظ", cancel: "إلغاء", saving: "جارٍ الحفظ...",
    profileSaved: "تم تحديث الملف الشخصي.",
    addressTitle: "عناويني",
    addressSubtitle: "أدر عناوينك المحفوظة. يُستخدم العنوان الافتراضي تلقائياً عند الدفع.",
    addAddress: "إضافة عنوان جديد",
    addressSaved: "تم حفظ العنوان.",
    addressUpdated: "تم تحديث العنوان.",
    addressDeleted: "تمت إزالة العنوان.",
    defaultSet: "تم تحديث العنوان الافتراضي.",
    setDefault: "تعيين كافتراضي",
    defaultBadge: "افتراضي",
    noAddress: "لا توجد عناوين محفوظة.",
    noAddressDesc: "احفظ بيانات التوصيل لتُملأ تلقائياً في طلبك التالي.",
    labelPlaceholder: "تسمية العنوان (مثال: المنزل، العمل)",
    label: "التسمية",
    fullName: "الاسم الكامل", addressPhone: "الهاتف", addressLine: "العنوان",
    addressLinePlaceholder: "الشارع، رقم المبنى، رقم الشقة",
    city: "المدينة", district: "المنطقة", postalCode: "الرمز البريدي", country: "البلد",
    makeDefault: "حفظ كافتراضي",
    changePassword: {
      title: "تغيير كلمة المرور",
      subtitle: "حافظ على أمان حسابك بتحديث كلمة المرور بانتظام.",
      current: "كلمة المرور الحالية", newPass: "كلمة المرور الجديدة", confirm: "تأكيد كلمة المرور الجديدة",
      submit: "تحديث كلمة المرور", submitting: "جارٍ التحديث...",
      success: "تم تحديث كلمة المرور بنجاح.",
      mismatch: "كلمتا المرور الجديدتان غير متطابقتين.",
      tooShort: "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.",
    },
  },
};

const accountLinks = { TR: "/hesabim", EN: "/en/account", AR: "/ar/account" };
const favoritesLinks = { TR: "/favorilerim", EN: "/en/favorites", AR: "/ar/favorites" };
const ordersLinks = { TR: "/siparislerim", EN: "/en/orders", AR: "/ar/orders" };
const loginLinks = { TR: "/giris", EN: "/en/login", AR: "/ar/login" };
const homeLinks = { TR: "/", EN: "/en", AR: "/ar" };

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Account() {
  const { lang, isRTL } = useLanguage();
  const { user, isAuthenticated, isLoading, logout, updateProfile } = useAuth();
  const { favoritesCount } = useFavorites();
  const { ordersCount } = useOrders();
  const [, setLocation] = useLocation();
  const tx = t[lang];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(`${loginLinks[lang]}?redirect=${encodeURIComponent(accountLinks[lang])}`);
    }
  }, [isLoading, isAuthenticated, lang, setLocation]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-24">
          <p className="font-body text-xs text-[#1C1C1E]/40 tracking-[0.2em] uppercase animate-pulse">
            {isLoading ? "..." : tx.loginRequired}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    toast.success(tx.loggedOut);
    setLocation(homeLinks[lang]);
  };

  const displayName = user.name || user.email || tx.member;
  const initials = (user.name || user.email || "V")
    .split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const shortcuts = [
    { key: "profile", title: tx.profile.title, desc: tx.profile.desc, href: accountLinks[lang], Icon: UserIcon, countLabel: null },
    { key: "favorites", title: tx.favorites.title, desc: tx.favorites.desc, href: favoritesLinks[lang], Icon: Heart, countLabel: `${favoritesCount} ${favoritesCount === 1 ? tx.favorites.countOne : tx.favorites.countMany}` },
    { key: "orders", title: tx.orders.title, desc: tx.orders.desc, href: ordersLinks[lang], Icon: Package, countLabel: `${ordersCount} ${ordersCount === 1 ? tx.orders.countOne : tx.orders.countMany}` },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-12 lg:mb-16">
            <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-4">{tx.overline}</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#1C1C1E] text-[#F7F3EC] flex items-center justify-center font-display text-xl lg:text-2xl tracking-wide flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <h1 className="font-display text-3xl lg:text-4xl text-[#1C1C1E] leading-tight">{tx.welcome}, {displayName}</h1>
                  <p className="font-body text-sm text-[#1C1C1E]/60 mt-1.5 max-w-xl">{tx.subtitle}</p>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="self-start sm:self-end inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors">
                <LogOut size={14} /> {tx.logout}
              </button>
            </div>
          </div>

          {/* Shortcuts */}
          <section className="mb-16">
            <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E]/40 mb-5">{tx.quickAccess}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {shortcuts.map(({ key, title, desc, href, Icon, countLabel }) => (
                <Link key={key} href={href} className="group relative bg-white border border-[#C9A96E]/15 hover:border-[#C9A96E]/50 transition-all duration-300 p-7 lg:p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#F7F3EC] border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] group-hover:bg-[#C9A96E] group-hover:text-white transition-colors duration-300">
                      <Icon size={18} strokeWidth={1.6} />
                    </div>
                    {countLabel && <span className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mt-2">{countLabel}</span>}
                  </div>
                  <h3 className="font-display text-xl lg:text-2xl text-[#1C1C1E] mb-2 leading-snug">{title}</h3>
                  <p className="font-body text-sm text-[#1C1C1E]/55 leading-relaxed flex-1">{desc}</p>
                  <div className="mt-7 flex items-center justify-end">
                    <ChevronRight size={16} className={`text-[#1C1C1E]/40 group-hover:text-[#C9A96E] transition-all duration-300 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Editable Profile */}
          <EditableProfileSection user={user} tx={tx} updateProfile={updateProfile} isRTL={isRTL} />

          {/* Addresses */}
          <AddressesSection tx={tx} isRTL={isRTL} />

          {/* Change Password */}
          <ChangePasswordSection tx={tx.changePassword} isRTL={isRTL} />

        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Editable Profile ──────────────────────────────────────────────────────────

function EditableProfileSection({
  user, tx, updateProfile, isRTL,
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
    if (!editing) { setName(user.name ?? ""); setPhone(user.phone ?? ""); }
  }, [user, editing]);

  const handleCancel = () => { setName(user.name ?? ""); setPhone(user.phone ?? ""); setError(null); setEditing(false); };

  const handleSave = async () => {
    if (name.trim().length < 2) { setError(tx.name + " en az 2 karakter olmalıdır."); return; }
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
    <section className="bg-white border border-[#C9A96E]/15 p-8 lg:p-10 mb-6">
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#C9A96E]/15">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-display text-xl text-[#1C1C1E]">{tx.profileTitle}</h2>
          <span className={`inline-flex items-center gap-1.5 font-body text-[10px] tracking-[0.18em] uppercase ${user.emailVerified ? "text-emerald-600" : "text-[#1C1C1E]/40"}`}>
            <ShieldCheck size={13} />
            {user.emailVerified ? tx.verified : tx.notVerified}
          </span>
        </div>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors">
            <Pencil size={13} /> {tx.edit}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleCancel} className="inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 hover:text-[#1C1C1E] transition-colors">
              <XIcon size={13} /> {tx.cancel}
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-4 py-2 hover:bg-[#C9A96E] transition-colors disabled:opacity-50">
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {isSaving ? tx.saving : tx.save}
            </button>
          </div>
        )}
      </div>
      {error && <p className="mb-5 font-body text-xs text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8" dir={isRTL ? "rtl" : "ltr"}>
        <ProfileField label={tx.name} value={name} editing={editing} onChange={setName} autoComplete="name" />
        <ProfileField label={tx.email} value={user.email ?? tx.notProvided} editing={false} />
        <ProfileField label={tx.phone} value={phone} editing={editing} onChange={setPhone} type="tel" placeholder={tx.notProvided} autoComplete="tel" />
        <ProfileField label={tx.role} value={user.role === "admin" ? "Admin" : tx.member} editing={false} />
      </div>
    </section>
  );
}

function ProfileField({ label, value, editing, onChange, type = "text", placeholder, autoComplete }: {
  label: string; value: string; editing: boolean;
  onChange?: (v: string) => void; type?: string; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/45 mb-2">{label}</label>
      {editing && onChange ? (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete}
          className="w-full bg-transparent border-0 border-b border-[#C9A96E] px-0 py-2 font-body text-base text-[#1C1C1E] focus:outline-none transition-colors" />
      ) : (
        <p className="font-body text-base text-[#1C1C1E] py-2 border-b border-[#1C1C1E]/10 break-words">{value || placeholder || "—"}</p>
      )}
    </div>
  );
}

// ─── Addresses Section ─────────────────────────────────────────────────────────

type AddrTx = (typeof t)[keyof typeof t];
type AddrFormData = Omit<SavedAddress, "id" | "isDefault"> & { isDefault: boolean };

const blankForm = (): AddrFormData => ({ ...emptyAddress, label: "", isDefault: false });

function AddressesSection({ tx, isRTL }: { tx: AddrTx; isRTL: boolean }) {
  const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddress();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<AddrFormData>(blankForm);
  const [editForm, setEditForm] = useState<AddrFormData>(blankForm);

  const handleAdd = () => {
    if (!addForm.address.trim() || !addForm.city.trim() || !addForm.fullName.trim()) return;
    addAddress({ ...addForm, isDefault: addForm.isDefault || addresses.length === 0 });
    toast.success(tx.addressSaved);
    setAddForm(blankForm());
    setShowAddForm(false);
  };

  const handleEditSave = (id: string) => {
    if (!editForm.address.trim() || !editForm.city.trim() || !editForm.fullName.trim()) return;
    updateAddress(id, editForm);
    toast.success(tx.addressUpdated);
    setEditingId(null);
  };

  const handleRemove = (id: string) => {
    removeAddress(id);
    toast(tx.addressDeleted);
  };

  const handleSetDefault = (id: string) => {
    setDefault(id);
    toast.success(tx.defaultSet);
  };

  return (
    <section className="bg-white border border-[#C9A96E]/15 p-8 lg:p-10 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-5 border-b border-[#C9A96E]/15 mb-8">
        <div className="flex items-center gap-3">
          <MapPin size={18} className="text-[#C9A96E] flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-xl text-[#1C1C1E]">{tx.addressTitle}</h2>
            <p className="font-body text-xs text-[#1C1C1E]/50 mt-0.5">{tx.addressSubtitle}</p>
          </div>
        </div>
        {!showAddForm && (
          <button type="button" onClick={() => { setShowAddForm(true); setAddForm(blankForm()); }}
            className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors flex-shrink-0">
            <Plus size={14} /> {tx.addAddress}
          </button>
        )}
      </div>

      {/* Address list */}
      {addresses.length === 0 && !showAddForm ? (
        <div className="py-8 flex flex-col items-center text-center gap-3">
          <MapPin size={28} className="text-[#C9A96E]/40" strokeWidth={1.4} />
          <p className="font-display text-lg text-[#1C1C1E]">{tx.noAddress}</p>
          <p className="font-body text-sm text-[#1C1C1E]/55 max-w-sm">{tx.noAddressDesc}</p>
          <button type="button" onClick={() => setShowAddForm(true)}
            className="mt-2 font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-7 py-3 hover:bg-[#C9A96E] transition-colors">
            {tx.addAddress}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) =>
            editingId === addr.id ? (
              /* Edit card */
              <AddressFormCard
                key={addr.id}
                form={editForm}
                setForm={setEditForm}
                tx={tx}
                isRTL={isRTL}
                onSave={() => handleEditSave(addr.id)}
                onCancel={() => setEditingId(null)}
                saveLabel={tx.save}
              />
            ) : (
              /* View card */
              <AddressViewCard
                key={addr.id}
                addr={addr}
                tx={tx}
                isRTL={isRTL}
                onEdit={() => {
                  setEditForm({
                    label: addr.label,
                    fullName: addr.fullName,
                    phone: addr.phone,
                    address: addr.address,
                    city: addr.city,
                    district: addr.district,
                    postalCode: addr.postalCode,
                    country: addr.country,
                    isDefault: addr.isDefault,
                  });
                  setEditingId(addr.id);
                }}
                onRemove={() => handleRemove(addr.id)}
                onSetDefault={() => handleSetDefault(addr.id)}
              />
            )
          )}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="mt-6">
          <AddressFormCard
            form={addForm}
            setForm={setAddForm}
            tx={tx}
            isRTL={isRTL}
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            saveLabel={tx.addressSaved ? tx.save : tx.addAddress}
            showDefaultToggle={true}
          />
        </div>
      )}
    </section>
  );
}

function AddressViewCard({
  addr, tx, isRTL, onEdit, onRemove, onSetDefault,
}: {
  addr: SavedAddress; tx: AddrTx; isRTL: boolean;
  onEdit: () => void; onRemove: () => void; onSetDefault: () => void;
}) {
  const lines = [
    addr.address,
    [addr.district, addr.city, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean);

  return (
    <div className={`border ${addr.isDefault ? "border-[#C9A96E]/50 bg-[#C9A96E]/5" : "border-[#1C1C1E]/10"} p-5 transition-colors`}
      dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {addr.label && (
            <span className="font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/70 font-semibold">
              {addr.label}
            </span>
          )}
          {addr.isDefault && (
            <span className="inline-flex items-center gap-1 font-body text-[9px] tracking-[0.18em] uppercase text-[#C9A96E] border border-[#C9A96E]/50 px-2 py-0.5">
              <Star size={9} fill="currentColor" /> {tx.defaultBadge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {!addr.isDefault && (
            <button type="button" onClick={onSetDefault}
              className="font-body text-[10px] tracking-[0.15em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors">
              {tx.setDefault}
            </button>
          )}
          <button type="button" onClick={onEdit} className="text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors" aria-label={tx.edit}>
            <Pencil size={14} />
          </button>
          <button type="button" onClick={onRemove} className="text-[#1C1C1E]/40 hover:text-red-500 transition-colors" aria-label="delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="font-body text-sm text-[#1C1C1E] font-medium">{addr.fullName}</p>
      {addr.phone && <p className="font-body text-sm text-[#1C1C1E]/60 mt-0.5">{addr.phone}</p>}
      <div className="mt-2 space-y-0.5">
        {lines.map((line, i) => (
          <p key={i} className="font-body text-sm text-[#1C1C1E]/70">{line}</p>
        ))}
      </div>
    </div>
  );
}

function AddressFormCard({
  form, setForm, tx, isRTL, onSave, onCancel, saveLabel, showDefaultToggle = true,
}: {
  form: AddrFormData;
  setForm: React.Dispatch<React.SetStateAction<AddrFormData>>;
  tx: AddrTx; isRTL: boolean;
  onSave: () => void; onCancel: () => void;
  saveLabel?: string; showDefaultToggle?: boolean;
}) {
  const upd = (field: keyof AddrFormData, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const isValid = form.address.trim() && form.city.trim() && form.fullName.trim();

  return (
    <div className="border border-[#C9A96E]/40 p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <AddrInputField label={tx.label} value={form.label} onChange={(v) => upd("label", v)} placeholder={tx.labelPlaceholder} className="sm:col-span-2" />
        <AddrInputField label={tx.fullName} value={form.fullName} onChange={(v) => upd("fullName", v)} autoComplete="name" />
        <AddrInputField label={tx.addressPhone} value={form.phone} onChange={(v) => upd("phone", v)} type="tel" autoComplete="tel" />
        <AddrInputField label={tx.addressLine} value={form.address} onChange={(v) => upd("address", v)} placeholder={tx.addressLinePlaceholder} autoComplete="street-address" className="sm:col-span-2" />
        <AddrInputField label={tx.city} value={form.city} onChange={(v) => upd("city", v)} autoComplete="address-level2" />
        <AddrInputField label={tx.district} value={form.district} onChange={(v) => upd("district", v)} />
        <AddrInputField label={tx.postalCode} value={form.postalCode} onChange={(v) => upd("postalCode", v)} autoComplete="postal-code" />
        <AddrInputField label={tx.country} value={form.country} onChange={(v) => upd("country", v)} autoComplete="country-name" />
      </div>

      {showDefaultToggle && (
        <label className="inline-flex items-center gap-2 cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => upd("isDefault", e.target.checked)}
            className="w-3.5 h-3.5 accent-[#C9A96E]"
          />
          <span className="font-body text-xs text-[#1C1C1E]/60">{tx.makeDefault}</span>
        </label>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button type="button" onClick={onSave} disabled={!isValid}
          className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-7 py-3 hover:bg-[#C9A96E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Check size={13} /> {saveLabel ?? tx.save}
        </button>
        <button type="button" onClick={onCancel}
          className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/55 hover:text-[#1C1C1E] transition-colors">
          <XIcon size={13} /> {tx.cancel}
        </button>
      </div>
    </div>
  );
}

function AddrInputField({ label, value, onChange, type = "text", placeholder, autoComplete, className = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; autoComplete?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/45 mb-2">{label}</label>
      <input type={type} value={value} placeholder={placeholder} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b border-[#C9A96E] px-0 py-2 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none transition-colors" />
    </div>
  );
}

// ─── Change Password ───────────────────────────────────────────────────────────

type CpTx = (typeof t)[keyof typeof t]["changePassword"];

function ChangePasswordSection({ tx, isRTL }: { tx: CpTx; isRTL: boolean }) {
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
    if (newPassword.length < 8) { setError(tx.tooShort); return; }
    if (newPassword !== confirmPassword) { setError(tx.mismatch); return; }
    setIsSubmitting(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      toast.success(tx.success);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-[#C9A96E]/15 p-8 lg:p-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 pb-5 border-b border-[#C9A96E]/15 mb-7">
        <KeyRound size={18} className="text-[#C9A96E] flex-shrink-0" />
        <div>
          <h2 className="font-display text-xl text-[#1C1C1E]">{tx.title}</h2>
          <p className="font-body text-xs text-[#1C1C1E]/50 mt-0.5">{tx.subtitle}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <PasswordField label={tx.current} value={currentPassword} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} onChange={setCurrentPassword} autoComplete="current-password" isRTL={isRTL} />
        <PasswordField label={tx.newPass} value={newPassword} show={showNew} onToggle={() => setShowNew(v => !v)} onChange={setNewPassword} autoComplete="new-password" isRTL={isRTL} />
        <PasswordField label={tx.confirm} value={confirmPassword} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} onChange={setConfirmPassword} autoComplete="new-password" isRTL={isRTL} />
        {error && <p className="font-body text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
          className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-8 py-3.5 hover:bg-[#C9A96E] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting && <Loader2 size={13} className="animate-spin" />}
          {isSubmitting ? tx.submitting : tx.submit}
        </button>
      </form>
    </section>
  );
}

function PasswordField({ label, value, show, onToggle, onChange, autoComplete, isRTL }: {
  label: string; value: string; show: boolean; onToggle: () => void;
  onChange: (v: string) => void; autoComplete?: string; isRTL: boolean;
}) {
  return (
    <div>
      <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 mb-2">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-transparent border-0 border-b border-[#1C1C1E]/20 px-0 py-2.5 font-body text-sm text-[#1C1C1E] focus:outline-none focus:border-[#C9A96E] transition-colors ${isRTL ? "pl-8" : "pr-8"}`} />
        <button type="button" onClick={onToggle}
          className={`absolute top-1/2 -translate-y-1/2 text-[#1C1C1E]/40 hover:text-[#C9A96E] transition-colors ${isRTL ? "left-0" : "right-0"}`}
          aria-label={show ? "hide" : "show"}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
