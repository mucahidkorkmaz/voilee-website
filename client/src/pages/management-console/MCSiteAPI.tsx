import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Copy, Globe, Key, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MCSiteAPI() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.settings.get.useQuery(undefined, { retry: false });
  const updateMutation = trpc.admin.settings.update.useMutation({
    onSuccess: () => { utils.admin.settings.get.invalidate(); toast.success("Ayarlar kaydedildi."); setDirty(false); },
    onError: e => toast.error(e.message),
  });

  const [storeName, setStoreName] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => { if (data) { setStoreName(data.storeName ?? "VOILÉE"); } }, [data]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} kopyalandı.`));
  };

  const apiBase = window.location.origin + "/api/trpc";

  const endpoints = [
    { method: "GET", path: "admin.stats", desc: "Dashboard istatistikleri" },
    { method: "GET", path: "admin.products.list", desc: "Tüm ürünler" },
    { method: "GET", path: "admin.orders.list", desc: "Tüm siparişler" },
    { method: "GET", path: "admin.collections.list", desc: "Tüm koleksiyonlar" },
    { method: "GET", path: "admin.cms.list", desc: "CMS sayfaları" },
    { method: "GET", path: "admin.revenue.stats", desc: "Gelir istatistikleri" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Yapılandırma</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Site & API</h1>
        </div>
        <Globe className="h-5 w-5 text-muted-foreground/40" />
      </div>

      {/* Site Info */}
      <section className="space-y-5">
        <div className="pb-3 border-b border-border/40">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">Site Bilgileri</p>
        </div>
        {isLoading ? <div className="h-10 bg-muted animate-pulse rounded" /> : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Site Adı</Label>
              <Input value={storeName} onChange={e => { setStoreName(e.target.value); setDirty(true); }} placeholder="VOILÉE" className="max-w-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Site URL</Label>
              <div className="flex items-center gap-2 max-w-sm">
                <Input value={window.location.origin} readOnly className="bg-muted/30 text-muted-foreground" />
                <button onClick={() => copyToClipboard(window.location.origin, "Site URL")} className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <Button onClick={() => updateMutation.mutate({ storeName })} disabled={!dirty || updateMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />{updateMutation.isPending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        )}
      </section>

      {/* API Reference */}
      <section className="space-y-5">
        <div className="pb-3 border-b border-border/40">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">API Referansı</p>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">API Base URL</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono text-foreground">{apiBase}</code>
              <button onClick={() => copyToClipboard(apiBase, "API URL")} className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground"><Copy className="h-4 w-4" /></button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Tüm API çağrıları oturum cookie'si (<code className="bg-muted px-1 rounded">app_session_id</code>) gerektirir.
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded overflow-hidden">
          <div className="px-5 py-3 border-b border-border/40 bg-muted/20">
            <p className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Mevcut Endpoint'ler (Admin)</p>
          </div>
          <div className="divide-y divide-border/20">
            {endpoints.map(ep => (
              <div key={ep.path} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{ep.method}</span>
                  <code className="text-xs font-mono text-foreground">/api/trpc/{ep.path}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden md:block">{ep.desc}</span>
                  <button onClick={() => copyToClipboard(`${apiBase}/${ep.path}`, ep.path)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground"><Copy className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Info */}
      <section className="space-y-5">
        <div className="pb-3 border-b border-border/40">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">Kimlik Doğrulama</p>
        </div>
        <div className="bg-muted/30 border border-border/40 rounded p-5 space-y-3">
          <div className="flex items-center gap-2"><Key className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-medium">JWT Tabanlı Oturum</p></div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            API çağrıları için önce <code className="bg-muted px-1 rounded">POST /api/local-login</code> veya{" "}
            <code className="bg-muted px-1 rounded">POST /api/auth/login</code> endpoint'ini kullanarak oturum açın.
            Oturum cookie'si otomatik olarak sonraki isteklere eklenir.
          </p>
        </div>
      </section>
    </div>
  );
}
