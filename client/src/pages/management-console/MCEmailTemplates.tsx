import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  EMAIL_TEMPLATE_GROUPS,
  EMAIL_TEMPLATE_META,
  type EmailTemplateKey,
} from "@shared/const";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  Mail,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ActiveTemplate = {
  key: EmailTemplateKey;
  subject: string;
  body: string;
};

type PanelTab = "edit" | "preview";

export default function MCEmailTemplates() {
  const { data: templates, isLoading, refetch } = trpc.admin.emailTemplates.list.useQuery();
  const [activeGroupId, setActiveGroupId] = useState(EMAIL_TEMPLATE_GROUPS[0].id);
  const [active, setActive] = useState<ActiveTemplate | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("edit");
  const [isDirty, setIsDirty] = useState(false);

  const updateMutation = trpc.admin.emailTemplates.upsert.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Şablon kaydedildi.");
      setIsDirty(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const resetMutation = trpc.admin.emailTemplates.reset.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Şablon varsayılana sıfırlandı.");
      if (active) {
        const meta = EMAIL_TEMPLATE_META[active.key];
        setActive({ key: active.key, subject: meta.defaultSubject, body: meta.defaultBody });
        setIsDirty(false);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const openTemplate = (key: EmailTemplateKey) => {
    const meta = EMAIL_TEMPLATE_META[key];
    const existing = templates?.[key];
    setActive({
      key,
      subject: existing?.subject || meta.defaultSubject,
      body: existing?.body || meta.defaultBody,
    });
    setPanelTab("edit");
    setIsDirty(false);
  };

  const handleSave = () => {
    if (!active) return;
    updateMutation.mutate({ key: active.key, subject: active.subject, body: active.body });
  };

  const handleReset = () => {
    if (!active) return;
    if (!confirm("Bu şablonu varsayılan içeriğe sıfırlamak istediğinizden emin misiniz?")) return;
    resetMutation.mutate({ key: active.key });
  };

  const isCustomized = (key: EmailTemplateKey) => {
    const t = templates?.[key];
    if (!t) return false;
    return (t.subject && t.subject.trim() !== "") || (t.body && t.body.trim() !== "");
  };

  const activeGroup = EMAIL_TEMPLATE_GROUPS.find((g) => g.id === activeGroupId) ?? EMAIL_TEMPLATE_GROUPS[0];
  const activeMeta = active ? EMAIL_TEMPLATE_META[active.key] : null;

  const appendVariable = (varKey: string) => {
    if (!active) return;
    const tag = `{{${varKey}}}`;
    setActive((s) => s ? { ...s, body: s.body + tag } : s);
    setIsDirty(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sol kenar çubuğu ─────────────────────────────────── */}
      <aside className="w-72 shrink-0 flex flex-col border-r border-border/60 bg-muted/20">
        <div className="px-5 pt-6 pb-4 border-b border-border/60">
          <h1 className="text-base font-semibold">E-posta Bildirimleri</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Şablonları özelleştirin</p>
        </div>

        {/* Grup sekmeleri */}
        <div className="flex gap-0.5 px-3 pt-3 pb-1 flex-wrap">
          {EMAIL_TEMPLATE_GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeGroupId === group.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* Şablon listesi */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {isLoading
            ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
            : activeGroup.keys.map((key) => {
                const meta = EMAIL_TEMPLATE_META[key];
                const customized = isCustomized(key);
                const isSelected = active?.key === key;

                return (
                  <button
                    key={key}
                    onClick={() => openTemplate(key)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                      isSelected
                        ? "bg-background border border-border shadow-sm"
                        : "hover:bg-accent/60"
                    }`}
                  >
                    <div className={`mt-0.5 flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors ${
                      isSelected ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Mail className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium leading-tight ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                          {meta.label}
                        </span>
                        {customized && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                        {meta.description}
                      </p>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 mt-1 shrink-0 text-muted-foreground/50 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                  </button>
                );
              })}
        </div>
      </aside>

      {/* ── Sağ panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {active && activeMeta ? (
          <>
            {/* Panel başlığı */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
                  <button
                    onClick={() => setPanelTab("edit")}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                      panelTab === "edit"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Pencil className="h-3 w-3" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => setPanelTab("preview")}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                      panelTab === "preview"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    Önizleme
                  </button>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{activeMeta.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {isCustomized(active.key) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={resetMutation.isPending}
                    className="h-8 text-xs text-muted-foreground gap-1.5"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Sıfırla
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending || !isDirty}
                  className="h-8 text-xs"
                >
                  {updateMutation.isPending ? "Kaydediliyor…" : "Kaydet"}
                </Button>
              </div>
            </div>

            {/* Panel gövdesi */}
            <div className="flex-1 overflow-y-auto">
              {panelTab === "edit" ? (
                <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                  {/* Konu */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Konu Satırı
                    </Label>
                    <Input
                      value={active.subject}
                      onChange={(e) => {
                        setActive((s) => s ? { ...s, subject: e.target.value } : s);
                        setIsDirty(true);
                      }}
                      placeholder={activeMeta.defaultSubject}
                      className="text-sm"
                    />
                  </div>

                  {/* Gövde */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Giriş Metni
                    </Label>
                    <Textarea
                      value={active.body}
                      onChange={(e) => {
                        setActive((s) => s ? { ...s, body: e.target.value } : s);
                        setIsDirty(true);
                      }}
                      rows={6}
                      placeholder={activeMeta.defaultBody}
                      className="resize-none font-mono text-sm leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Bu metin e-postanın sipariş / müşteri detaylarından önce gösterilir.
                    </p>
                  </div>

                  {/* Değişkenler */}
                  {activeMeta.variables.length > 0 && (
                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Kullanılabilir Değişkenler</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Değişkene tıklayarak metne ekleyin.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeMeta.variables.map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => appendVariable(v.key)}
                            title={v.description}
                            className="group relative flex items-center gap-1 bg-background border border-border rounded-md px-2.5 py-1 text-xs font-mono transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            {`{{${v.key}}}`}
                            <span className="pointer-events-none absolute bottom-full left-0 mb-1.5 hidden group-hover:flex items-center bg-foreground text-background text-[10px] font-sans rounded-md px-2 py-1 whitespace-nowrap z-20 shadow-md">
                              {v.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Önizleme */
                <div className="h-full bg-muted/40 flex items-start justify-center px-6 py-8 overflow-y-auto">
                  <div className="w-full max-w-lg">
                    <p className="text-xs text-muted-foreground text-center mb-4">
                      Konu: <span className="font-medium text-foreground">{active.subject}</span>
                    </p>
                    <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
                      {/* E-posta başlığı */}
                      <div className="bg-foreground px-8 py-6 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-background/10 mb-3">
                          <Mail className="h-5 w-5 text-background/80" />
                        </div>
                        <p className="text-background/50 text-xs tracking-widest uppercase">Bildirim</p>
                      </div>

                      {/* E-posta gövdesi */}
                      <div className="px-8 py-7 space-y-5">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {active.body || activeMeta.defaultBody}
                        </p>

                        {/* Örnek sipariş detayı */}
                        <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Sipariş No</span>
                            <span className="font-medium text-foreground">#1001</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Tarih</span>
                            <span className="font-medium text-foreground">11 Nisan 2026</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Tutar</span>
                            <span className="font-medium text-foreground">₺1.250,00</span>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-block bg-foreground text-background text-xs font-medium px-5 py-2.5 rounded-lg">
                            Siparişi Görüntüle
                          </div>
                        </div>
                      </div>

                      {/* E-posta alt bilgisi */}
                      <div className="border-t border-border/60 px-8 py-5 text-center bg-muted/20">
                        <p className="text-[11px] text-muted-foreground">
                          Bu e-posta mağaza bildirim sistemi tarafından gönderilmiştir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Boş durum */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Şablon seçin</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Sol panelden bir e-posta şablonu seçerek düzenlemeye başlayın.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
