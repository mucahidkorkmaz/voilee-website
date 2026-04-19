import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Pencil, Plus, Trash2, Webhook } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EVENT_LABELS: Record<string, string> = {
  "order.created": "Sipariş Oluşturuldu", "order.updated": "Sipariş Güncellendi",
  "order.shipped": "Kargoya Verildi", "order.delivered": "Teslim Edildi",
  "order.cancelled": "Sipariş İptal", "product.created": "Ürün Eklendi",
  "product.updated": "Ürün Güncellendi", "product.deleted": "Ürün Silindi",
  "user.registered": "Kullanıcı Kaydı",
};
const EVENTS = Object.keys(EVENT_LABELS) as (keyof typeof EVENT_LABELS)[];

type WebhookForm = { name: string; url: string; event: string; secret: string; isActive: boolean; };
const emptyForm: WebhookForm = { name: "", url: "", event: "order.created", secret: "", isActive: true };

export default function MCWebhooks() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.webhooks.list.useQuery(undefined, { retry: false });
  const createMutation = trpc.admin.webhooks.create.useMutation({
    onSuccess: () => { utils.admin.webhooks.list.invalidate(); toast.success("Webhook oluşturuldu."); setOpen(false); setForm(emptyForm); },
    onError: e => toast.error(e.message),
  });
  const updateMutation = trpc.admin.webhooks.update.useMutation({
    onSuccess: () => { utils.admin.webhooks.list.invalidate(); toast.success("Webhook güncellendi."); setOpen(false); setEditId(null); },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.webhooks.delete.useMutation({
    onSuccess: () => { utils.admin.webhooks.list.invalidate(); toast.success("Webhook silindi."); setDeleteId(null); },
    onError: e => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<WebhookForm>(emptyForm);
  const set = (k: keyof WebhookForm, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (w: NonNullable<typeof data>[number]) => {
    setEditId(w.id);
    setForm({ name: w.name, url: w.url, event: w.event, secret: w.secret ?? "", isActive: w.isActive ?? true });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.url) { toast.error("Ad ve URL zorunludur."); return; }
    const payload = { name: form.name, url: form.url, event: form.event as any, secret: form.secret || undefined, isActive: form.isActive };
    if (editId !== null) updateMutation.mutate({ id: editId, ...payload });
    else createMutation.mutate(payload);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Pazarlama</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Webhooks</h1>
        </div>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setOpen(true); }} size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Yeni Webhook</Button>
      </div>

      {error && <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><p>Veri yüklenemedi.</p></div>}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
        ) : !data?.length ? (
          <div className="p-12 text-center">
            <Webhook className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Henüz webhook tanımlanmamış.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["Ad", "Olay", "URL", "Durum", "Son Tetiklenme", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(w => (
                  <tr key={w.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{w.name}</td>
                    <td className="px-5 py-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground font-mono">{w.event}</span></td>
                    <td className="px-5 py-3.5 max-w-xs"><p className="truncate text-muted-foreground text-xs font-mono">{w.url}</p></td>
                    <td className="px-5 py-3.5"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${w.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{w.isActive ? "Aktif" : "Pasif"}</span></td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{w.lastTriggeredAt ? new Date(w.lastTriggeredAt).toLocaleDateString("tr-TR") : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(w)} className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteId(w.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">{editId !== null ? "Webhook Düzenle" : "Yeni Webhook"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ad *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Sipariş Bildirimi" /></div>
            <div className="space-y-1.5"><Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Olay *</Label>
              <Select value={form.event} onValueChange={v => set("event", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EVENTS.map(e => <SelectItem key={e} value={e}>{EVENT_LABELS[e]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">URL *</Label><Input value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-1.5"><Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Gizli Anahtar (İsteğe bağlı)</Label><Input value={form.secret} onChange={e => set("secret", e.target.value)} placeholder="İmzalama anahtarı" type="password" /></div>
            <div className="flex items-center gap-3"><Switch id="wh-active" checked={form.isActive} onCheckedChange={v => set("isActive", v)} /><Label htmlFor="wh-active" className="text-sm font-normal cursor-pointer">Aktif</Label></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? "Kaydediliyor…" : editId !== null ? "Güncelle" : "Oluştur"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Webhook'u Sil</AlertDialogTitle><AlertDialogDescription>Bu webhook'u kalıcı olarak silmek istiyor musunuz?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
