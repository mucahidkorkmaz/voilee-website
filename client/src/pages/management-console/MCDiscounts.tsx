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
import { AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type DiscountForm = {
  code: string; type: "percentage" | "fixed"; value: string;
  minOrderAmount: string; maxUses: string; isActive: boolean; expiresAt: string;
};
const emptyForm: DiscountForm = { code: "", type: "percentage", value: "", minOrderAmount: "", maxUses: "", isActive: true, expiresAt: "" };

export default function MCDiscounts() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.discounts.list.useQuery(undefined, { retry: false });
  const createMutation = trpc.admin.discounts.create.useMutation({
    onSuccess: () => { utils.admin.discounts.list.invalidate(); toast.success("İndirim kodu oluşturuldu."); setOpen(false); setForm(emptyForm); },
    onError: e => toast.error(e.message),
  });
  const updateMutation = trpc.admin.discounts.update.useMutation({
    onSuccess: () => { utils.admin.discounts.list.invalidate(); toast.success("İndirim kodu güncellendi."); setOpen(false); setEditId(null); },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.discounts.delete.useMutation({
    onSuccess: () => { utils.admin.discounts.list.invalidate(); toast.success("İndirim kodu silindi."); setDeleteId(null); },
    onError: e => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<DiscountForm>(emptyForm);

  const set = (k: keyof DiscountForm, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (d: NonNullable<typeof data>[number]) => {
    setEditId(d.id);
    setForm({
      code: d.code, type: d.type as "percentage" | "fixed", value: d.value,
      minOrderAmount: d.minOrderAmount ?? "", maxUses: d.maxUses?.toString() ?? "",
      isActive: d.isActive ?? true,
      expiresAt: d.expiresAt ? new Date(d.expiresAt).toISOString().slice(0, 16) : "",
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.code || !form.value) { toast.error("Kod ve değer zorunludur."); return; }
    const payload = {
      code: form.code.toUpperCase(), type: form.type, value: form.value,
      minOrderAmount: form.minOrderAmount || undefined,
      maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
      isActive: form.isActive,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };
    if (editId !== null) updateMutation.mutate({ id: editId, ...payload });
    else createMutation.mutate(payload);
  };

  const isExpired = (d: NonNullable<typeof data>[number]) =>
    d.expiresAt && new Date(d.expiresAt) < new Date();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Finans</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">İndirimler</h1>
        </div>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setOpen(true); }} size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Yeni Kod</Button>
      </div>

      {error && <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><p>Veri yüklenemedi.</p></div>}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
        ) : !data?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Henüz indirim kodu bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["Kod", "Tip", "Değer", "Min. Tutar", "Kullanım", "Durum", "Son Geçerlilik", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(d => (
                  <tr key={d.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-medium text-xs tracking-widest">{d.code}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{d.type === "percentage" ? "Yüzde" : "Sabit"}</td>
                    <td className="px-5 py-3.5">{d.type === "percentage" ? `%${Number(d.value).toFixed(0)}` : `₺${Number(d.value).toFixed(2)}`}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{d.minOrderAmount ? `₺${Number(d.minOrderAmount).toFixed(2)}` : "—"}</td>
                    <td className="px-5 py-3.5">{d.usedCount ?? 0}{d.maxUses ? ` / ${d.maxUses}` : ""}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${d.isActive && !isExpired(d) ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {!d.isActive ? "Pasif" : isExpired(d) ? "Süresi Dolmuş" : "Aktif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString("tr-TR") : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteId(d.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
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
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">{editId !== null ? "Kodu Düzenle" : "Yeni İndirim Kodu"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Kod *</Label>
              <Input value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="YAZI25" className="font-mono tracking-widest" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Tip</Label>
                <Select value={form.type} onValueChange={v => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Yüzde (%)</SelectItem>
                    <SelectItem value="fixed">Sabit (₺)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Değer *</Label>
                <Input type="number" min="0" step="0.01" value={form.value} onChange={e => set("value", e.target.value)} placeholder={form.type === "percentage" ? "25" : "50.00"} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Min. Sipariş (₺)</Label>
                <Input type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={e => set("minOrderAmount", e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Maks. Kullanım</Label>
                <Input type="number" min="1" value={form.maxUses} onChange={e => set("maxUses", e.target.value)} placeholder="Sınırsız" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Son Geçerlilik</Label>
              <Input type="datetime-local" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="disc-active" checked={form.isActive} onCheckedChange={v => set("isActive", v)} />
              <Label htmlFor="disc-active" className="text-sm font-normal cursor-pointer">Aktif</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? "Kaydediliyor…" : editId !== null ? "Güncelle" : "Oluştur"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İndirim Kodunu Sil</AlertDialogTitle>
            <AlertDialogDescription>Bu indirim kodunu kalıcı olarak silmek istiyor musunuz?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
