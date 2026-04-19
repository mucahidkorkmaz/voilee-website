import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CmsForm = {
  slug: string; titleTR: string; titleEN: string; titleAR: string;
  contentTR: string; contentEN: string; contentAR: string; isPublished: boolean;
};
const emptyForm: CmsForm = { slug: "", titleTR: "", titleEN: "", titleAR: "", contentTR: "", contentEN: "", contentAR: "", isPublished: false };

export default function MCCMS() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.cms.list.useQuery(undefined, { retry: false });
  const createMutation = trpc.admin.cms.create.useMutation({
    onSuccess: () => { utils.admin.cms.list.invalidate(); toast.success("Sayfa oluşturuldu."); setOpen(false); setForm(emptyForm); },
    onError: e => toast.error(e.message),
  });
  const updateMutation = trpc.admin.cms.update.useMutation({
    onSuccess: () => { utils.admin.cms.list.invalidate(); toast.success("Sayfa güncellendi."); setOpen(false); setEditId(null); },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.cms.delete.useMutation({
    onSuccess: () => { utils.admin.cms.list.invalidate(); toast.success("Sayfa silindi."); setDeleteId(null); },
    onError: e => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<CmsForm>(emptyForm);
  const set = (k: keyof CmsForm, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (p: NonNullable<typeof data>[number]) => {
    setEditId(p.id);
    setForm({ slug: p.slug, titleTR: p.titleTR, titleEN: p.titleEN, titleAR: p.titleAR, contentTR: p.contentTR ?? "", contentEN: p.contentEN ?? "", contentAR: p.contentAR ?? "", isPublished: p.isPublished ?? false });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.titleTR || !form.titleEN || !form.titleAR || !form.slug) { toast.error("Zorunlu alanları doldurun."); return; }
    if (editId !== null) updateMutation.mutate({ id: editId, ...form });
    else createMutation.mutate(form);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">İçerik</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">İçerik (CMS)</h1>
        </div>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setOpen(true); }} size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Yeni Sayfa</Button>
      </div>

      {error && <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><p>Veri yüklenemedi.</p></div>}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
        ) : !data?.length ? (
          <div className="p-12 text-center"><FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Henüz sayfa oluşturulmamış.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["Başlık (TR)", "Slug", "Durum", "Güncellendi", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(p => (
                  <tr key={p.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{p.titleTR}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">/{p.slug}</td>
                    <td className="px-5 py-3.5"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{p.isPublished ? "Yayında" : "Taslak"}</span></td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{new Date(p.updatedAt).toLocaleDateString("tr-TR")}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">{editId !== null ? "Sayfayı Düzenle" : "Yeni Sayfa"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Slug (URL) *</Label>
              <Input value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="hakkimizda" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(["TR", "EN", "AR"] as const).map(lang => (
                <div key={lang} className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Başlık ({lang}) *</Label>
                  <Input value={form[`title${lang}` as keyof CmsForm] as string} onChange={e => set(`title${lang}` as keyof CmsForm, e.target.value)} />
                </div>
              ))}
            </div>
            {(["TR", "EN", "AR"] as const).map(lang => (
              <div key={`content-${lang}`} className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">İçerik ({lang})</Label>
                <textarea value={form[`content${lang}` as keyof CmsForm] as string} onChange={e => set(`content${lang}` as keyof CmsForm, e.target.value)} rows={5}
                  className="flex w-full rounded border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" placeholder={`Sayfa içeriği (${lang})`} />
              </div>
            ))}
            <div className="flex items-center gap-3"><Switch id="cms-pub" checked={form.isPublished} onCheckedChange={v => set("isPublished", v)} /><Label htmlFor="cms-pub" className="text-sm font-normal cursor-pointer">Yayınla</Label></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? "Kaydediliyor…" : editId !== null ? "Güncelle" : "Oluştur"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Sayfayı Sil</AlertDialogTitle><AlertDialogDescription>Bu sayfayı kalıcı olarak silmek istiyor musunuz?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
