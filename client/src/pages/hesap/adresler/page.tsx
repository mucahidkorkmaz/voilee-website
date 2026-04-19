import { useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Check,
  X as XIcon,
} from "lucide-react";
import AccountLayout from "../layout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useAddress,
  type SavedAddress,
  emptyAddress,
} from "@/contexts/AddressContext";
import { toast } from "sonner";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    overline: "Adreslerim",
    title: "Adres Defterim",
    subtitle:
      "Kayıtlı adreslerinizi yönetin. Varsayılan adres siparişlerde otomatik kullanılır.",
    addAddress: "Yeni Adres Ekle",
    addressSaved: "Adres kaydedildi.",
    addressUpdated: "Adres güncellendi.",
    addressDeleted: "Adres silindi.",
    defaultSet: "Varsayılan adres güncellendi.",
    setDefault: "Varsayılan Yap",
    defaultBadge: "Varsayılan",
    noAddress: "Kayıtlı adres yok.",
    noAddressDesc:
      "Teslimat bilgilerinizi kaydedin, bir sonraki siparişinizde otomatik doldurulsun.",
    label: "Adres Etiketi",
    labelPlaceholder: "ör. Ev, İş",
    fullName: "Ad Soyad",
    addressPhone: "Telefon",
    addressLine: "Adres",
    addressLinePlaceholder: "Sokak, bina no, daire no",
    city: "Şehir",
    district: "İlçe",
    postalCode: "Posta Kodu",
    country: "Ülke",
    makeDefault: "Varsayılan olarak kaydet",
    save: "Kaydet",
    cancel: "İptal",
    edit: "Düzenle",
  },
  EN: {
    overline: "My Addresses",
    title: "Address Book",
    subtitle:
      "Manage your saved addresses. The default address is auto-filled at checkout.",
    addAddress: "Add New Address",
    addressSaved: "Address saved.",
    addressUpdated: "Address updated.",
    addressDeleted: "Address removed.",
    defaultSet: "Default address updated.",
    setDefault: "Set as Default",
    defaultBadge: "Default",
    noAddress: "No saved addresses.",
    noAddressDesc:
      "Save your delivery info to have it auto-filled on your next order.",
    label: "Label",
    labelPlaceholder: "e.g. Home, Work",
    fullName: "Full Name",
    addressPhone: "Phone",
    addressLine: "Address",
    addressLinePlaceholder: "Street, building no, apt no",
    city: "City",
    district: "District",
    postalCode: "Postal Code",
    country: "Country",
    makeDefault: "Save as default",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
  },
  AR: {
    overline: "عناويني",
    title: "دفتر العناوين",
    subtitle:
      "أدر عناوينك المحفوظة. يُستخدم العنوان الافتراضي تلقائياً عند الدفع.",
    addAddress: "إضافة عنوان جديد",
    addressSaved: "تم حفظ العنوان.",
    addressUpdated: "تم تحديث العنوان.",
    addressDeleted: "تمت إزالة العنوان.",
    defaultSet: "تم تحديث العنوان الافتراضي.",
    setDefault: "تعيين كافتراضي",
    defaultBadge: "افتراضي",
    noAddress: "لا توجد عناوين محفوظة.",
    noAddressDesc: "احفظ بيانات التوصيل لتُملأ تلقائياً في طلبك التالي.",
    label: "التسمية",
    labelPlaceholder: "مثال: المنزل، العمل",
    fullName: "الاسم الكامل",
    addressPhone: "الهاتف",
    addressLine: "العنوان",
    addressLinePlaceholder: "الشارع، رقم المبنى، رقم الشقة",
    city: "المدينة",
    district: "المنطقة",
    postalCode: "الرمز البريدي",
    country: "البلد",
    makeDefault: "حفظ كافتراضي",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
  },
};

// ─── Types ──────────────────────────────────────────────────────────────────────

type Tx = (typeof t)[keyof typeof t];
type AddrForm = Omit<SavedAddress, "id" | "isDefault"> & { isDefault: boolean };

const blankForm = (): AddrForm => ({ ...emptyAddress, label: "", isDefault: false });

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AdreslerPage() {
  const { lang, isRTL } = useLanguage();
  const { addresses, addAddress, updateAddress, removeAddress, setDefault } =
    useAddress();
  const tx = t[lang];

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<AddrForm>(blankForm);
  const [editForm, setEditForm] = useState<AddrForm>(blankForm);

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
    <AccountLayout>
      {/* Header */}
      <div className="mb-8 lg:mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
            {tx.overline}
          </p>
          <h1 className="font-display text-3xl lg:text-4xl text-[#1C1C1E] leading-tight">
            {tx.title}
          </h1>
          <p className="font-body text-sm text-[#1C1C1E]/60 mt-2 max-w-xl">
            {tx.subtitle}
          </p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => { setShowAddForm(true); setAddForm(blankForm()); }}
            className={`inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Plus size={14} />
            {tx.addAddress}
          </button>
        )}
      </div>

      {/* Content */}
      {addresses.length === 0 && !showAddForm ? (
        <div className="bg-white border border-[#C9A96E]/15 py-16 px-6 flex flex-col items-center text-center">
          <MapPin size={28} className="text-[#C9A96E]/40 mb-4" strokeWidth={1.4} />
          <h2 className="font-display text-2xl text-[#1C1C1E] mb-2">
            {tx.noAddress}
          </h2>
          <p className="font-body text-sm text-[#1C1C1E]/55 max-w-sm mb-7">
            {tx.noAddressDesc}
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-7 py-3 hover:bg-[#C9A96E] transition-colors"
          >
            {tx.addAddress}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) =>
            editingId === addr.id ? (
              <AddressFormCard
                key={addr.id}
                form={editForm}
                setForm={setEditForm}
                tx={tx}
                isRTL={isRTL}
                onSave={() => handleEditSave(addr.id)}
                onCancel={() => setEditingId(null)}
                saveLabel={tx.save}
                showDefaultToggle
              />
            ) : (
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
        <div className="mt-4">
          <AddressFormCard
            form={addForm}
            setForm={setAddForm}
            tx={tx}
            isRTL={isRTL}
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            saveLabel={tx.save}
            showDefaultToggle
          />
        </div>
      )}
    </AccountLayout>
  );
}

// ─── Address View Card ──────────────────────────────────────────────────────────

function AddressViewCard({
  addr,
  tx,
  isRTL,
  onEdit,
  onRemove,
  onSetDefault,
}: {
  addr: SavedAddress;
  tx: Tx;
  isRTL: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onSetDefault: () => void;
}) {
  const lines = [
    addr.address,
    [addr.district, addr.city, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean);

  return (
    <div
      className={`border p-5 transition-colors ${
        addr.isDefault
          ? "border-[#C9A96E]/50 bg-[#C9A96E]/5"
          : "border-[#1C1C1E]/10 bg-white"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={`flex items-start justify-between gap-3 mb-3 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {addr.label && (
            <span className="font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/70 font-semibold">
              {addr.label}
            </span>
          )}
          {addr.isDefault && (
            <span className="inline-flex items-center gap-1 font-body text-[9px] tracking-[0.18em] uppercase text-[#C9A96E] border border-[#C9A96E]/50 px-2 py-0.5">
              <Star size={9} fill="currentColor" />
              {tx.defaultBadge}
            </span>
          )}
        </div>
        <div
          className={`flex items-center gap-3 flex-shrink-0 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          {!addr.isDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              className="font-body text-[10px] tracking-[0.15em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors"
            >
              {tx.setDefault}
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors"
            aria-label={tx.edit}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-[#1C1C1E]/40 hover:text-red-500 transition-colors"
            aria-label="delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="font-body text-sm text-[#1C1C1E] font-medium">
        {addr.fullName}
      </p>
      {addr.phone && (
        <p className="font-body text-sm text-[#1C1C1E]/60 mt-0.5">
          {addr.phone}
        </p>
      )}
      <div className="mt-2 space-y-0.5">
        {lines.map((line, i) => (
          <p key={i} className="font-body text-sm text-[#1C1C1E]/70">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Address Form Card ──────────────────────────────────────────────────────────

function AddressFormCard({
  form,
  setForm,
  tx,
  isRTL,
  onSave,
  onCancel,
  saveLabel,
  showDefaultToggle = true,
}: {
  form: AddrForm;
  setForm: React.Dispatch<React.SetStateAction<AddrForm>>;
  tx: Tx;
  isRTL: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  showDefaultToggle?: boolean;
}) {
  const upd = (field: keyof AddrForm, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const isValid =
    form.address.trim() && form.city.trim() && form.fullName.trim();

  return (
    <div
      className="border border-[#C9A96E]/40 bg-white p-5 lg:p-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <AddrField
          label={tx.label}
          value={form.label}
          onChange={(v) => upd("label", v)}
          placeholder={tx.labelPlaceholder}
          className="sm:col-span-2"
        />
        <AddrField
          label={tx.fullName}
          value={form.fullName}
          onChange={(v) => upd("fullName", v)}
          autoComplete="name"
        />
        <AddrField
          label={tx.addressPhone}
          value={form.phone}
          onChange={(v) => upd("phone", v)}
          type="tel"
          autoComplete="tel"
        />
        <AddrField
          label={tx.addressLine}
          value={form.address}
          onChange={(v) => upd("address", v)}
          placeholder={tx.addressLinePlaceholder}
          autoComplete="street-address"
          className="sm:col-span-2"
        />
        <AddrField
          label={tx.city}
          value={form.city}
          onChange={(v) => upd("city", v)}
          autoComplete="address-level2"
        />
        <AddrField
          label={tx.district}
          value={form.district}
          onChange={(v) => upd("district", v)}
        />
        <AddrField
          label={tx.postalCode}
          value={form.postalCode}
          onChange={(v) => upd("postalCode", v)}
          autoComplete="postal-code"
        />
        <AddrField
          label={tx.country}
          value={form.country}
          onChange={(v) => upd("country", v)}
          autoComplete="country-name"
        />
      </div>

      {showDefaultToggle && (
        <label
          className={`inline-flex items-center gap-2 cursor-pointer mb-5 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => upd("isDefault", e.target.checked)}
            className="w-3.5 h-3.5 accent-[#C9A96E]"
          />
          <span className="font-body text-xs text-[#1C1C1E]/60">
            {tx.makeDefault}
          </span>
        </label>
      )}

      <div
        className={`flex items-center gap-3 flex-wrap ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-7 py-3 hover:bg-[#C9A96E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check size={13} />
          {saveLabel ?? tx.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/55 hover:text-[#1C1C1E] transition-colors"
        >
          <XIcon size={13} />
          {tx.cancel}
        </button>
      </div>
    </div>
  );
}

function AddrField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/45 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 border-b border-[#C9A96E] px-0 py-2 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none transition-colors"
      />
    </div>
  );
}
