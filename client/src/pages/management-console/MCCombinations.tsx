import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Info, Pencil, RefreshCw, RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type EditForm = {
  nameTR: string;
  nameEN: string;
  nameAR: string;
  descriptionTR: string;
  descriptionEN: string;
  descriptionAR: string;
  imageUrl: string;
  price: string;
  status: "draft" | "published" | "archived";
  sortOrder: number;
  isActive: boolean;
};

function formatGalleryForEditor(galleryUrls: string | null): string {
  if (!galleryUrls?.trim()) return "[]";
  try {
    const p = JSON.parse(galleryUrls) as unknown;
    if (Array.isArray(p)) return JSON.stringify(p, null, 2);
  } catch {
    /* fallthrough */
  }
  return galleryUrls;
}

export default function MCCombinations() {
  const utils = trpc.useUtils();
  const { data: silhouettes } = trpc.admin.silhouettes.list.useQuery(undefined, { retry: false });
  const [selectedSilhouetteId, setSelectedSilhouetteId] = useState<number | null>(null);

  useEffect(() => {
    if (silhouettes?.length && selectedSilhouetteId === null) {
      setSelectedSilhouetteId(silhouettes[0].id);
    }
  }, [silhouettes, selectedSilhouetteId]);

  const { data: combos, isLoading, error } = trpc.admin.combinations.list.useQuery(
    { silhouetteId: selectedSilhouetteId! },
    { enabled: selectedSilhouetteId != null, retry: false },
  );

  const updateMutation = trpc.admin.combinations.update.useMutation({
    onSuccess: () => {
      utils.admin.combinations.list.invalidate();
      toast.success("Silüet güncellendi.");
      setDialogOpen(false);
      setEditingId(null);
    },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.combinations.delete.useMutation({
    onSuccess: () => {
      utils.admin.combinations.list.invalidate();
      toast.success("Silüet silindi.");
      setDeleteId(null);
    },
    onError: e => toast.error(e.message),
  });
  const regenerateMutation = trpc.admin.combinations.regenerate.useMutation({
    onSuccess: data => {
      utils.admin.combinations.list.invalidate();
      toast.success(`Yenilendi: ${data.created} yeni, ${data.archived} arşivlendi.`);
    },
    onError: e => toast.error(e.message),
  });
  const resetPriceMutation = trpc.admin.combinations.resetPrice.useMutation({
    onSuccess: data => {
      utils.admin.combinations.list.invalidate();
      toast.success("Fiyat otomatik değere alındı.");
      if (data?.price != null) {
        setForm(f => (f ? { ...f, price: String(data.price) } : f));
      }
    },
    onError: e => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [galleries, setGalleries] = useState<string[]>([]);

  const openEdit = (row: NonNullable<typeof combos>[number]) => {
    let parsed: string[] = [];
    try {
      const raw = formatGalleryForEditor(row.galleryUrls);
      const maybeList = JSON.parse(raw) as unknown;
      if (Array.isArray(maybeList)) {
        parsed = maybeList.map(item => String(item)).filter(Boolean);
      }
    } catch {
      parsed = [];
    }
    setGalleries(parsed);
    setEditingId(row.id);
    setForm({
      nameTR: row.nameTR,
      nameEN: row.nameEN,
      nameAR: row.nameAR,
      descriptionTR: row.descriptionTR ?? "",
      descriptionEN: row.descriptionEN ?? "",
      descriptionAR: row.descriptionAR ?? "",
      imageUrl: row.imageUrl ?? "",
      price: row.price,
      status: row.status,
      sortOrder: row.sortOrder ?? 0,
      isActive: row.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form || editingId === null) return;
    if (!form.nameTR || !form.nameEN || !form.nameAR || !form.price) {
      toast.error("İsim ve fiyat alanları zorunludur.");
      return;
    }
    const galleryUrls = JSON.stringify(galleries.filter(Boolean));
    const row = combos?.find(c => c.id === editingId);
    const payload: Parameters<typeof updateMutation.mutate>[0] = {
      id: editingId,
      nameTR: form.nameTR,
      nameEN: form.nameEN,
      nameAR: form.nameAR,
      descriptionTR: form.descriptionTR || undefined,
      descriptionEN: form.descriptionEN || undefined,
      descriptionAR: form.descriptionAR || undefined,
      imageUrl: form.imageUrl || undefined,
      galleryUrls,
      status: form.status,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };
    if (row && form.price !== row.price) {
      payload.price = form.price;
    }
    updateMutation.mutate(payload);
  };

  const statusBadge = (status: string) => {
    if (status === "published")
      return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Yayında</span>;
    if (status === "draft")
      return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700">Taslak</span>;
    return <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">Arşiv</span>;
  };

  const editingRow = combos?.find(c => c.id === editingId);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Katalog</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Silüetler</h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Silüet başına ürün kartezyen çarpımından oluşan satılabilir silüetler. Ürün eklediğinizde veya
            sildiğinizde silüetler otomatik güncellenir.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedSilhouetteId != null ? String(selectedSilhouetteId) : ""}
            onValueChange={v => setSelectedSilhouetteId(parseInt(v, 10))}
            disabled={!silhouettes?.length}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Silüet seçin" />
            </SelectTrigger>
            <SelectContent>
              {silhouettes?.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.nameTR}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={selectedSilhouetteId == null || regenerateMutation.isPending}
            onClick={() => selectedSilhouetteId != null && regenerateMutation.mutate({ silhouetteId: selectedSilhouetteId })}
          >
            <RefreshCw className={`h-4 w-4 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
            Silüetleri yenile
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Veri yüklenemedi</p>
            <p className="text-xs mt-0.5 text-amber-700">{error.message}</p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading || selectedSilhouetteId === null ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !combos?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Bu silüet için sonuç yok. En az iki farklı kategoride aktif ürün ekleyin veya &quot;Silüetleri
            yenile&quot; ile hesaplatın.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="text-left py-3 px-4 text-xs tracking-wider uppercase text-muted-foreground font-normal w-16">
                    Görsel
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-wider uppercase text-muted-foreground font-normal min-w-[160px]">
                    İsim (TR)
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-wider uppercase text-muted-foreground font-normal min-w-[200px]">
                    Ürünler
                  </th>
                  <th className="text-right py-3 px-4 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap">
                    Otomatik
                  </th>
                  <th className="text-right py-3 px-4 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap">
                    Satış
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      Stok
                      <span
                        title="Stok, bileşen ürün veya varyantların minimum stoğundan hesaplanır (MIN)."
                        className="inline-flex text-muted-foreground/70"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 text-xs tracking-wider uppercase text-muted-foreground font-normal">
                    Durum
                  </th>
                  <th className="text-right py-3 px-4 text-xs tracking-wider uppercase text-muted-foreground font-normal w-28">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {combos.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4 align-top">
                      {row.imageUrl ? (
                        <img src={row.imageUrl} alt="" className="h-12 w-12 rounded object-cover border border-border/40" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted border border-border/40" />
                      )}
                    </td>
                    <td className="py-3 px-4 align-top font-light max-w-[220px]">{row.nameTR}</td>
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {row.items.map(it => (
                          <span
                            key={`${row.id}-${it.id}`}
                            className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-secondary/80 text-secondary-foreground"
                          >
                            {it.variantName ? `${it.productName ?? "—"} (${it.variantName})` : it.productName ?? "—"}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top text-right text-muted-foreground tabular-nums">₺{row.autoPrice}</td>
                    <td className="py-3 px-4 align-top text-right tabular-nums font-medium">
                      <span className="inline-flex items-center justify-end gap-1">
                        ₺{row.price}
                        {row.priceOverridden ? <Pencil className="h-3 w-3 text-muted-foreground shrink-0" /> : null}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-top">
                      {row.stock > 0 ? (
                        <span
                          className="inline-flex text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 tabular-nums"
                          title="Bileşenlerin minimum stoğu"
                        >
                          {row.stock}
                        </span>
                      ) : (
                        <span className="inline-flex text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800">
                          Tükendi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top">{statusBadge(row.status)}</td>
                    <td className="py-3 px-4 align-top text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(row.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">Silüeti düzenle</DialogTitle>
          </DialogHeader>
          {form && editingRow ? (
            <div className="space-y-4 py-2">
              <div className="grid gap-3">
                <div>
                  <Label>İsim (TR)</Label>
                  <Input value={form.nameTR} onChange={e => setForm({ ...form, nameTR: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>İsim (EN)</Label>
                  <Input value={form.nameEN} onChange={e => setForm({ ...form, nameEN: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>İsim (AR)</Label>
                  <Input value={form.nameAR} onChange={e => setForm({ ...form, nameAR: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid gap-3">
                <div>
                  <Label>Açıklama (TR)</Label>
                  <Textarea
                    value={form.descriptionTR}
                    onChange={e => setForm({ ...form, descriptionTR: e.target.value })}
                    className="mt-1 min-h-[72px]"
                  />
                </div>
                <div>
                  <Label>Açıklama (EN)</Label>
                  <Textarea
                    value={form.descriptionEN}
                    onChange={e => setForm({ ...form, descriptionEN: e.target.value })}
                    className="mt-1 min-h-[72px]"
                  />
                </div>
                <div>
                  <Label>Açıklama (AR)</Label>
                  <Textarea
                    value={form.descriptionAR}
                    onChange={e => setForm({ ...form, descriptionAR: e.target.value })}
                    className="mt-1 min-h-[72px]"
                  />
                </div>
              </div>
              <ImageUpload value={form.imageUrl} onChange={url => setForm({ ...form, imageUrl: url })} label="Kapak görseli" />
              <div>
                <Label>Galeri Görselleri</Label>
                {galleries.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {galleries.map((url, idx) => (
                      <div key={`${url}-${idx}`} className="relative group w-20 h-20 shrink-0">
                        <img
                          src={url}
                          alt={`Galeri ${idx + 1}`}
                          className="w-full h-full object-cover rounded border border-border/40"
                        />
                        <button
                          type="button"
                          onClick={() => setGalleries(g => g.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Görseli kaldır"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2">
                  <ImageUpload
                    value=""
                    onChange={url => {
                      if (url) setGalleries(g => [...g, url]);
                    }}
                    label="Galeri görseli ekle"
                  />
                </div>
                {galleries.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1.5">Henüz galeri görseli eklenmedi.</p>
                )}
              </div>
              <div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1">
                    <Label>Satış fiyatı</Label>
                    <Input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1" />
                  </div>
                  <div className="text-xs text-muted-foreground pb-2 shrink-0">Otomatik: ₺{editingRow.autoPrice}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-1"
                  disabled={resetPriceMutation.isPending || editingId === null}
                  onClick={() => editingId != null && resetPriceMutation.mutate({ id: editingId })}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Otomatiğe dön
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label>Sıra</Label>
                <Input
                  type="number"
                  className="w-24"
                  value={form.sortOrder}
                  onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between rounded border border-border/40 px-3 py-2">
                <Label htmlFor="combo-active">Aktif</Label>
                <Switch id="combo-active" checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
              </div>
              <div>
                <Label>Durum</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as EditForm["status"] })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="published">Yayında</SelectItem>
                    <SelectItem value="archived">Arşiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Bu silüetteki ürünler</Label>
                <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground border border-border/40 rounded p-3 bg-muted/10">
                  {editingRow.items.map(it => (
                    <li key={it.id}>
                      <span className="text-foreground/80">
                        {it.variantName ? `${it.productName ?? "—"} — ${it.variantName}` : it.productName ?? "—"}
                      </span>
                      {it.categoryName ? (
                        <span className="text-muted-foreground"> · {it.categoryName}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silüeti sil?</AlertDialogTitle>
            <AlertDialogDescription>Bu silüet kalıcı olarak silinecektir. Bu işlem geri alınamaz.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId != null && deleteMutation.mutate({ id: deleteId })}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
