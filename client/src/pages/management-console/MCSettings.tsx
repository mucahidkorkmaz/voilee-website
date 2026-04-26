import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ImageIcon, Loader2, Save, Settings, Upload, Wifi, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MCSettingsUsersTab } from "./MCSettingsUsersTab";

const TABS = [
  { id: "general", label: "Genel" },
  { id: "social", label: "Sosyal Medya" },
  { id: "email", label: "E-posta" },
  { id: "legal", label: "Yasal" },
  { id: "integrations", label: "Entegrasyonlar" },
  { id: "users", label: "Kullanıcılar" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type SettingsForm = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  faviconUrl: string;
  logoUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  pinterestUrl: string;
  linkedinUrl: string;
  snapchatUrl: string;
  whatsappUrl: string;
  telegramUrl: string;
  freeShippingThreshold: string;
  shippingCostDomestic: string;
  shippingCostInternational: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  taxNumber: string;
  taxOffice: string;
  companyType: string;
  mersis: string;
  parasutClientId: string;
  parasutClientSecret: string;
  parasutCompanyId: string;
  parasutEnabled: boolean;
};

const emptyForm: SettingsForm = {
  storeName: "",
  storeEmail: "",
  storePhone: "",
  storeAddress: "",
  faviconUrl: "",
  logoUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  pinterestUrl: "",
  linkedinUrl: "",
  smtpHost: "",
  smtpPort: "587",
  smtpSecure: false,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  snapchatUrl: "",
  whatsappUrl: "",
  telegramUrl: "",
  freeShippingThreshold: "500",
  shippingCostDomestic: "49.99",
  shippingCostInternational: "199.99",
  taxNumber: "",
  taxOffice: "",
  companyType: "",
  mersis: "",
  parasutClientId: "",
  parasutClientSecret: "",
  parasutCompanyId: "",
  parasutEnabled: false,
};

type TabProps = {
  form: SettingsForm;
  set: (field: keyof SettingsForm, value: string | boolean) => void;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-3 border-b border-border/40">
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">{children}</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">Veri yüklenemedi</p>
        <p className="text-xs mt-0.5 text-amber-700">{message}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-10 bg-muted animate-pulse rounded" />
      ))}
    </div>
  );
}

const SOCIAL_PLATFORMS = [
  { key: "instagramUrl" as const, label: "Instagram", placeholder: "https://instagram.com/voilee" },
  { key: "facebookUrl" as const, label: "Facebook", placeholder: "https://facebook.com/voilee" },
  { key: "twitterUrl" as const, label: "X / Twitter", placeholder: "https://x.com/voilee" },
  { key: "youtubeUrl" as const, label: "YouTube", placeholder: "https://youtube.com/@voilee" },
  { key: "tiktokUrl" as const, label: "TikTok", placeholder: "https://tiktok.com/@voilee" },
  { key: "pinterestUrl" as const, label: "Pinterest", placeholder: "https://pinterest.com/voilee" },
  { key: "linkedinUrl" as const, label: "LinkedIn", placeholder: "https://linkedin.com/company/voilee" },
  { key: "snapchatUrl" as const, label: "Snapchat", placeholder: "https://snapchat.com/add/voilee" },
  { key: "whatsappUrl" as const, label: "WhatsApp", placeholder: "https://wa.me/905000000000" },
  { key: "telegramUrl" as const, label: "Telegram", placeholder: "https://t.me/voilee" },
];

function TabGeneral({ form, set }: TabProps) {
  const [faviconUploading, setFaviconUploading] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFaviconUpload = async (file: File) => {
    setFaviconUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) {
        const { error: msg } = await res.json();
        toast.error(msg ?? "Yükleme başarısız.");
        return;
      }
      const { url } = await res.json();
      set("faviconUrl", url);
      toast.success("Favicon yüklendi. Kaydetmeyi unutmayın.");
    } catch {
      toast.error("Yükleme sırasında bir hata oluştu.");
    } finally {
      setFaviconUploading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) {
        const { error: msg } = await res.json();
        toast.error(msg ?? "Yükleme başarısız.");
        return;
      }
      const { url } = await res.json();
      set("logoUrl", url);
      toast.success("Logo yüklendi. Kaydetmeyi unutmayın.");
    } catch {
      toast.error("Yükleme sırasında bir hata oluştu.");
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <>
      <section className="space-y-5">
        <SectionTitle>Mağaza Bilgileri</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Mağaza Adı</Label>
            <Input
              value={form.storeName}
              onChange={e => set("storeName", e.target.value)}
              placeholder="VOILÉE"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">İletişim E-posta</Label>
            <Input
              type="email"
              value={form.storeEmail}
              onChange={e => set("storeEmail", e.target.value)}
              placeholder="info@voilee.com.tr"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Telefon</Label>
            <Input
              value={form.storePhone}
              onChange={e => set("storePhone", e.target.value)}
              placeholder="+90 212 000 00 00"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Adres</Label>
            <textarea
              value={form.storeAddress}
              onChange={e => set("storeAddress", e.target.value)}
              placeholder="Mağaza adresi..."
              rows={3}
              className="flex w-full rounded border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Favicon (Sekme İkonu)</Label>
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-10 h-10 rounded border border-border/60 bg-muted flex items-center justify-center overflow-hidden">
                {form.faviconUrl ? (
                  <img src={form.faviconUrl} alt="favicon önizleme" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept=".ico,.png,.svg,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFaviconUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={faviconUploading}
                  onClick={() => faviconInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {faviconUploading ? "Yükleniyor…" : "Dosya Seç"}
                </Button>
                {form.faviconUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set("faviconUrl", "")}
                    className="gap-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                    Kaldır
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tarayıcı sekmesinde görünen ikon. .ico, .png veya .svg önerilir (32×32 veya 64×64 px).
            </p>
          </div>

          <hr className="md:col-span-2 border-border/40" />

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
              Site Logosu (E-posta ve Genel Kullanım)
            </Label>
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-24 h-16 rounded border border-border/60 bg-muted flex items-center justify-center overflow-hidden">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="logo önizleme" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.svg,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={logoUploading}
                  onClick={() => logoInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {logoUploading ? "Yükleniyor…" : "Dosya Seç"}
                </Button>
                {form.logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set("logoUrl", "")}
                    className="gap-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                    Kaldır
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              E-posta üstbilgisi, navbar ve footer gibi alanlarda kullanılır. PNG veya SVG önerilir, şeffaf arka planlı.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle>Kargo Ayarları</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
              Ücretsiz Kargo Eşiği (₺)
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.freeShippingThreshold}
              onChange={e => set("freeShippingThreshold", e.target.value)}
              placeholder="500.00"
            />
            <p className="text-xs text-muted-foreground">Bu tutarın üzerindeki siparişlerde kargo ücretsiz.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Yurt İçi Kargo (₺)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.shippingCostDomestic}
              onChange={e => set("shippingCostDomestic", e.target.value)}
              placeholder="49.99"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Yurt Dışı Kargo (₺)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.shippingCostInternational}
              onChange={e => set("shippingCostInternational", e.target.value)}
              placeholder="199.99"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function TabSocial({ form, set }: TabProps) {
  return (
    <section className="space-y-5">
      <SectionTitle>Sosyal Medya & Platformlar</SectionTitle>
      <p className="text-xs text-muted-foreground -mt-2">Yalnızca doldurduğunuz platformlar web sitesinde gösterilir.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">{label}</Label>
            <Input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
          </div>
        ))}
      </div>
    </section>
  );
}

function TabEmail({ form, set }: TabProps) {
  return (
    <section className="space-y-4">
      <SectionTitle>SMTP Konfigürasyonu</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">SMTP Sunucu</Label>
          <Input value={form.smtpHost} onChange={e => set("smtpHost", e.target.value)} placeholder="smtp.gmail.com" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Port</Label>
          <Input value={form.smtpPort} onChange={e => set("smtpPort", e.target.value)} placeholder="587" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Kullanıcı Adı</Label>
          <Input value={form.smtpUser} onChange={e => set("smtpUser", e.target.value)} placeholder="info@voilee.com.tr" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Şifre</Label>
          <Input
            type="password"
            value={form.smtpPass}
            onChange={e => set("smtpPass", e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Gönderen Adres</Label>
          <Input
            value={form.smtpFrom}
            onChange={e => set("smtpFrom", e.target.value)}
            placeholder="VOILÉE <info@voilee.com.tr>"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="smtpSecure"
            checked={form.smtpSecure}
            onChange={e => set("smtpSecure", e.target.checked)}
            className="h-4 w-4"
          />
          <Label
            htmlFor="smtpSecure"
            className="text-xs tracking-wider uppercase text-muted-foreground font-normal cursor-pointer"
          >
            TLS (Port 465)
          </Label>
        </div>
      </div>
    </section>
  );
}

function TabLegal({ form, set }: TabProps) {
  return (
    <section className="space-y-5">
      <SectionTitle>Yasal Bilgiler</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Vergi No / TC Kimlik No</Label>
          <Input value={form.taxNumber} onChange={e => set("taxNumber", e.target.value)} placeholder="1234567890" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Vergi Dairesi</Label>
          <Input value={form.taxOffice} onChange={e => set("taxOffice", e.target.value)} placeholder="Nişantaşı Vergi Dairesi" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Şirket Türü</Label>
          <select
            value={form.companyType}
            onChange={e => set("companyType", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Seçiniz</option>
            <option value="sahis">Şahıs Şirketi</option>
            <option value="limited">Limited Şirketi</option>
            <option value="anonim">Anonim Şirketi</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">MERSİS No</Label>
          <Input value={form.mersis} onChange={e => set("mersis", e.target.value)} placeholder="0123456789012345" />
        </div>
      </div>
    </section>
  );
}

function TabIntegrations({ form, set }: TabProps) {
  const testMutation = trpc.admin.settings.testParasut.useMutation({
    onSuccess: res =>
      res.success ? toast.success(res.message ?? "Bağlantı başarılı.") : toast.error(res.error ?? "Bağlantı başarısız."),
    onError: e => toast.error(e.message),
  });

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle>Paraşüt Entegrasyonu</SectionTitle>
        <div className="flex items-center gap-2 pb-3">
          <span className="text-xs text-muted-foreground">{form.parasutEnabled ? "Aktif" : "Pasif"}</span>
          <input
            type="checkbox"
            checked={form.parasutEnabled}
            onChange={e => set("parasutEnabled", e.target.checked)}
            className="h-4 w-4"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Aktif edildiğinde siparişler teslim edildiğinde Paraşüt&apos;te otomatik e-arşiv fatura oluşturulur.{" "}
        <a
          href="https://apidocs.parasut.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          API Dokümantasyonu →
        </a>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Client ID</Label>
          <Input
            type="password"
            value={form.parasutClientId}
            onChange={e => set("parasutClientId", e.target.value)}
            placeholder="••••••••"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Client Secret</Label>
          <Input
            type="password"
            value={form.parasutClientSecret}
            onChange={e => set("parasutClientSecret", e.target.value)}
            placeholder="••••••••"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Firma ID</Label>
          <Input value={form.parasutCompanyId} onChange={e => set("parasutCompanyId", e.target.value)} placeholder="123456" />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
            className="gap-2 w-full"
          >
            {testMutation.isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Test ediliyor…
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3" /> Bağlantıyı Test Et
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function MCSettings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading, error } = trpc.admin.settings.get.useQuery(undefined, { retry: false });
  const updateMutation = trpc.admin.settings.update.useMutation({
    onSuccess: () => {
      utils.admin.settings.get.invalidate();
      toast.success("Ayarlar kaydedildi.");
    },
    onError: e => toast.error(e.message),
  });

  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("general");

  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.storeName ?? "",
        storeEmail: settings.storeEmail ?? "",
        storePhone: settings.storePhone ?? "",
        storeAddress: settings.storeAddress ?? "",
        faviconUrl: settings.faviconUrl ?? "",
        logoUrl: settings.logoUrl ?? "",
        instagramUrl: settings.instagramUrl ?? "",
        facebookUrl: settings.facebookUrl ?? "",
        twitterUrl: settings.twitterUrl ?? "",
        youtubeUrl: settings.youtubeUrl ?? "",
        tiktokUrl: settings.tiktokUrl ?? "",
        pinterestUrl: settings.pinterestUrl ?? "",
        linkedinUrl: settings.linkedinUrl ?? "",
        snapchatUrl: settings.snapchatUrl ?? "",
        whatsappUrl: settings.whatsappUrl ?? "",
        telegramUrl: settings.telegramUrl ?? "",
        freeShippingThreshold: settings.freeShippingThreshold ?? "500",
        shippingCostDomestic: settings.shippingCostDomestic ?? "49.99",
        shippingCostInternational: settings.shippingCostInternational ?? "199.99",
        smtpHost: settings.smtpHost ?? "",
        smtpPort: settings.smtpPort ?? "587",
        smtpSecure: settings.smtpSecure === true,
        smtpUser: settings.smtpUser ?? "",
        smtpPass: settings.smtpPass ?? "",
        smtpFrom: settings.smtpFrom ?? "",
        taxNumber: settings.taxNumber ?? "",
        taxOffice: settings.taxOffice ?? "",
        companyType: settings.companyType ?? "",
        mersis: settings.mersis ?? "",
        parasutClientId: settings.parasutClientId ?? "",
        parasutClientSecret: settings.parasutClientSecret ?? "",
        parasutCompanyId: settings.parasutCompanyId ?? "",
        parasutEnabled: settings.parasutEnabled === true,
      });
      setDirty(false);
    }
  }, [settings]);

  const set = (field: keyof SettingsForm, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    const companyType =
      form.companyType === "sahis" || form.companyType === "limited" || form.companyType === "anonim"
        ? form.companyType
        : undefined;
    updateMutation.mutate({ ...form, companyType });
    setDirty(false);
  };

  const errorMessage = error
    ? error.message.includes("10002")
      ? "Bu verilere erişmek için admin yetkisi gereklidir."
      : error.message.includes("10001")
        ? "Verileri görüntülemek için giriş yapmanız gereklidir."
        : "Veritabanı bağlantısı kurulamadı. DATABASE_URL ortam değişkenini kontrol edin."
    : "";

  return (
    <div
      className={cn(
        "p-6 md:p-8 space-y-6",
        activeTab === "users" ? "max-w-6xl" : "max-w-3xl",
      )}
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Yapılandırma</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Mağaza Ayarları</h1>
        </div>
        <Settings className="h-5 w-5 text-muted-foreground/40" />
      </div>

      {error && activeTab !== "users" && <ErrorBanner message={errorMessage} />}

      <div className="flex gap-0.5 border-b border-border/40 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs tracking-wider uppercase whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-foreground text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" ? (
        <MCSettingsUsersTab />
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-10">
          {activeTab === "general" && <TabGeneral form={form} set={set} />}
          {activeTab === "social" && <TabSocial form={form} set={set} />}
          {activeTab === "email" && <TabEmail form={form} set={set} />}
          {activeTab === "legal" && <TabLegal form={form} set={set} />}
          {activeTab === "integrations" && <TabIntegrations form={form} set={set} />}

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            {settings?.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Son güncelleme:{" "}
                {new Date(settings.updatedAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || !dirty}
              className="gap-2 ml-auto"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
