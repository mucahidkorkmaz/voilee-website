import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
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

type CollectionForm = {
  slug: string; nameTR: string; nameEN: string; nameAR: string;
  descriptionTR: string; descriptionEN: string; descriptionAR: string;
  imageUrl: string; isActive: boolean; sortOrder: number;
};

const emptyForm: CollectionForm = {
  slug: "", nameTR: "", nameEN: "", nameAR: "",
  descriptionTR: "", descriptionEN: "", descriptionAR: "",
  imageUrl: "", isActive: true, sortOrder: 0,
};

export default function MCCollections() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.collections.list.useQuery(undefined, { retry: false });
  const createMutation = trpc.admin.collections.create.useMutation({
    onSuccess: () => { utils.admin.collections.list.invalidate(); toast.success("Koleksiyon oluşturuldu."); setOpen(false); setForm(emptyForm); },
    onError: e => toast.error(e.message),
  });
  const updateMutation = trpc.admin.collections.update.useMutation({
    onSuccess: () => { utils.admin.collections.list.invalidate(); toast.success("Koleksiyon güncellendi."); setOpen(false); setEditId(null); },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.collections.delete.useMutation({
    onSuccess: () => { utils.admin.collections.list.invalidate(); toast.success("Koleksiyon silindi."); setDeleteId(null); },
    onError: e => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<CollectionForm>(emptyForm);

  const set = (k: keyof CollectionForm, v: string | boolean | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: NonNullable<typeof data>[number]) => {
    setEditId(c.id);
    setForm({ slug: c.slug, nameTR: c.nameTR, nameEN: c.nameEN, nameAR: c.nameAR,
      descriptionTR: c.descriptionTR ?? "", descriptionEN: c.descriptionEN ?? "",
      descriptionAR: c.descriptionAR ?? "", imageUrl: c.imageUrl ?? "",
      isActive: c.isActive ?? true, sortOrder: c.sortOrder ?? 0 });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.nameTR || !form.nameEN || !form.nameAR || !form.slug) {
      toast.error("Lütfen zorunlu alanları doldurun."); return;
    }
    if (editId !== null) updateMutation.mutate({ id: editId, ...form });
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Katalog</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Koleksiyonlar</h1>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Yeni Koleksiyon</Button>
      </div>

      {error && <ErrorAlert message={error.message} />}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? <LoadingSkeleton /> : !data?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Henüz koleksiyon bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["Görsel", "İsim (TR)", "Slug", "Sıra", "Durum", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(c => (
                  <tr key={c.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      {c.imageUrl ? <img src={c.imageUrl} alt={c.nameTR} className="h-10 w-10 object-cover rounded border border-border/30" />
                        : <div className="h-10 w-10 bg-muted rounded border border-border/30" />}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{c.nameTR}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{c.slug}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.sortOrder}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {c.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">{editId !== null ? "Koleksiyonu Düzenle" : "Yeni Koleksiyon"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Slug (URL) *</Label>
              <Input value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="ornek-koleksiyon" />
            </div>
            {(["TR", "EN", "AR"] as const).map(lang => (
              <div key={lang} className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">İsim ({lang}) *</Label>
                <Input value={form[`name${lang}` as keyof CollectionForm] as string} onChange={e => set(`name${lang}` as keyof CollectionForm, e.target.value)} placeholder={`Koleksiyon adı (${lang})`} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Sıralama</Label>
              <Input type="number" value={form.sortOrder} onChange={e => set("sortOrder", parseInt(e.target.value) || 0)} />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                value={form.imageUrl}
                onChange={url => set("imageUrl", url)}
                label="Görsel"
              />
            </div>
            {(["TR", "EN", "AR"] as const).map(lang => (
              <div key={`desc-${lang}`} className="space-y-1.5 md:col-span-2">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Açıklama ({lang})</Label>
                <textarea value={form[`description${lang}` as keyof CollectionForm] as string} onChange={e => set(`description${lang}` as keyof CollectionForm, e.target.value)} rows={2}
                  className="flex w-full rounded border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
              </div>
            ))}
            <div className="flex items-center gap-3 md:col-span-2">
              <Switch id="col-active" checked={form.isActive} onCheckedChange={v => set("isActive", v)} />
              <Label htmlFor="col-active" className="text-sm font-normal cursor-pointer">Aktif — sitede görünür</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={handleSubmit} disabled={isPending}>{isPending ? "Kaydediliyor…" : editId !== null ? "Güncelle" : "Oluştur"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Koleksiyonu Sil</AlertDialogTitle>
            <AlertDialogDescription>Bu koleksiyonu kalıcı olarak silmek istiyor musunuz?</AlertDialogDescription>
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

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      <p>{message.includes("10002") ? "Bu verilere erişmek için admin yetkisi gereklidir." : message.includes("10001") ? "Giriş yapmanız gereklidir." : "Veritabanı bağlantısı kurulamadı."}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
    </div>
  );
}
