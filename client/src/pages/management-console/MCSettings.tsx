import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Settings, Save, ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SettingsForm = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  faviconUrl: string;
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
};

const emptyForm: SettingsForm = {
  storeName: "",
  storeEmail: "",
  storePhone: "",
  storeAddress: "",
  faviconUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  pinterestUrl: "",
  linkedinUrl: "",
  snapchatUrl: "",
  whatsappUrl: "",
  telegramUrl: "",
  freeShippingThreshold: "500",
  shippingCostDomestic: "49.99",
  shippingCostInternational: "199.99",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-3 border-b border-border/40">
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">
        {children}
      </p>
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
  const [faviconUploading, setFaviconUploading] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.storeName ?? "",
        storeEmail: settings.storeEmail ?? "",
        storePhone: settings.storePhone ?? "",
        storeAddress: settings.storeAddress ?? "",
        faviconUrl: settings.faviconUrl ?? "",
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
      });
      setDirty(false);
    }
  }, [settings]);

  const set = (field: keyof SettingsForm, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    updateMutation.mutate(form);
    setDirty(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
            Yapılandırma
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
            Mağaza Ayarları
          </h1>
        </div>
        <Settings className="h-5 w-5 text-muted-foreground/40" />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Veri yüklenemedi</p>
            <p className="text-xs mt-0.5 text-amber-700">
              {error.message.includes("10002")
                ? "Bu verilere erişmek için admin yetkisi gereklidir."
                : error.message.includes("10001")
                ? "Verileri görüntülemek için giriş yapmanız gereklidir."
                : "Veritabanı bağlantısı kurulamadı. DATABASE_URL ortam değişkenini kontrol edin."}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Mağaza Bilgileri */}
          <section className="space-y-5">
            <SectionTitle>Mağaza Bilgileri</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Mağaza Adı
                </Label>
                <Input
                  value={form.storeName}
                  onChange={e => set("storeName", e.target.value)}
                  placeholder="VOILÉE"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  İletişim E-posta
                </Label>
                <Input
                  type="email"
                  value={form.storeEmail}
                  onChange={e => set("storeEmail", e.target.value)}
                  placeholder="info@voilee.com.tr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Telefon
                </Label>
                <Input
                  value={form.storePhone}
                  onChange={e => set("storePhone", e.target.value)}
                  placeholder="+90 212 000 00 00"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Adres
                </Label>
                <textarea
                  value={form.storeAddress}
                  onChange={e => set("storeAddress", e.target.value)}
                  placeholder="Mağaza adresi..."
                  rows={3}
                  className="flex w-full rounded border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Favicon (Sekme İkonu)
                </Label>
                <div className="flex items-center gap-4">
                  {/* Önizleme */}
                  <div className="shrink-0 w-10 h-10 rounded border border-border/60 bg-muted flex items-center justify-center overflow-hidden">
                    {form.faviconUrl ? (
                      <img src={form.faviconUrl} alt="favicon önizleme" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                  {/* Yükleme butonu */}
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
            </div>
          </section>

          {/* Sosyal Medya & Platformlar */}
          <section className="space-y-5">
            <SectionTitle>Sosyal Medya & Platformlar</SectionTitle>
            <p className="text-xs text-muted-foreground -mt-2">
              Yalnızca doldurduğunuz platformlar web sitesinde gösterilir.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                    {label}
                  </Label>
                  <Input
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Kargo Ayarları */}
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
                <p className="text-xs text-muted-foreground">
                  Bu tutarın üzerindeki siparişlerde kargo ücretsiz.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Yurt İçi Kargo (₺)
                </Label>
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
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Yurt Dışı Kargo (₺)
                </Label>
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

          {/* Save */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
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
