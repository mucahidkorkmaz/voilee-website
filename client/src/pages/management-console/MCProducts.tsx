import { trpc } from "@/lib/trpc";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
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
import { Pencil, Plus, Trash2, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ProductFormData = {
  nameTR: string;
  nameEN: string;
  nameAR: string;
  descriptionTR: string;
  descriptionEN: string;
  descriptionAR: string;
  price: string;
  silhouetteId: number | null;
  categoryId: number | null;
  collection: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
};

type VariantFormData = {
  nameTR: string;
  nameEN: string;
  nameAR: string;
  sku: string;
  price: string;
  stock: number;
  imageUrl: string;
  colorHex: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyVariantForm: VariantFormData = {
  nameTR: "",
  nameEN: "",
  nameAR: "",
  sku: "",
  price: "",
  stock: 0,
  imageUrl: "",
  colorHex: "",
  sortOrder: 0,
  isActive: true,
};

const emptyForm: ProductFormData = {
  nameTR: "",
  nameEN: "",
  nameAR: "",
  descriptionTR: "",
  descriptionEN: "",
  descriptionAR: "",
  price: "",
  silhouetteId: null,
  categoryId: null,
  collection: "",
  imageUrl: "",
  stock: 0,
  isActive: true,
};

export default function MCProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading, error } = trpc.admin.products.list.useQuery(undefined, { retry: false });
  const { data: silhouettes } = trpc.admin.silhouettes.list.useQuery(undefined, { retry: false });
  const { data: categories } = trpc.admin.categories.list.useQuery(undefined, { retry: false });
  const productIds = products?.map(p => p.id) ?? [];
  const { data: variantSummaries } = trpc.admin.variants.summariesForProducts.useQuery(
    { productIds },
    { enabled: productIds.length > 0, retry: false },
  );
  const summaryByProductId = new Map(variantSummaries?.map(s => [s.productId, s]) ?? []);
  const createMutation = trpc.admin.products.create.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      toast.success("Ürün oluşturuldu.");
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: e => toast.error(e.message),
  });
  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      toast.success("Ürün güncellendi.");
      setDialogOpen(false);
      setEditingId(null);
    },
    onError: e => toast.error(e.message),
  });

  const createVariantMutation = trpc.admin.variants.create.useMutation({
    onSuccess: () => {
      utils.admin.variants.list.invalidate();
      utils.admin.variants.summariesForProducts.invalidate();
      utils.admin.combinations.list.invalidate();
      toast.success("Varyant eklendi.");
      setVariantDialogOpen(false);
      setVariantEditingId(null);
      setVariantForm(emptyVariantForm);
    },
    onError: e => toast.error(e.message),
  });
  const updateVariantMutation = trpc.admin.variants.update.useMutation({
    onSuccess: () => {
      utils.admin.variants.list.invalidate();
      utils.admin.variants.summariesForProducts.invalidate();
      utils.admin.combinations.list.invalidate();
      toast.success("Varyant güncellendi.");
      setVariantDialogOpen(false);
      setVariantEditingId(null);
    },
    onError: e => toast.error(e.message),
  });
  const deleteVariantMutation = trpc.admin.variants.delete.useMutation({
    onSuccess: () => {
      utils.admin.variants.list.invalidate();
      utils.admin.variants.summariesForProducts.invalidate();
      utils.admin.combinations.list.invalidate();
      toast.success("Varyant silindi.");
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Ürün silindi.");
      setDeleteId(null);
    },
    onError: e => toast.error(e.message),
  });
  const generateSerialsMutation = trpc.admin.verifications.generateBatch.useMutation({
    onSuccess: (data) => {
      utils.admin.verifications.list.invalidate();
      toast.success(`${data?.length ?? 0} adet seri numarası üretildi.`);
      setSerialDialog(null);
      setSerialCount(1);
      setSerialBatch("");
    },
    onError: e => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [serialDialog, setSerialDialog] = useState<{ id: number; name: string } | null>(null);
  const [serialCount, setSerialCount] = useState(1);
  const [serialBatch, setSerialBatch] = useState("");
  const [serialMaterial, setSerialMaterial] = useState("");
  const [serialProduction, setSerialProduction] = useState("");
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantEditingId, setVariantEditingId] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState<VariantFormData>(emptyVariantForm);

  const { data: variantsForEdit } = trpc.admin.variants.list.useQuery(
    { productId: editingId! },
    { enabled: dialogOpen && editingId !== null, retry: false },
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const variantCountForEdit = variantsForEdit?.length ?? 0;
  const effectiveStockDisplay =
    editingId != null && variantCountForEdit > 0
      ? (variantsForEdit ?? []).filter(v => v.isActive).reduce((s, v) => s + (v.stock ?? 0), 0)
      : null;

  const openVariantCreate = () => {
    setVariantEditingId(null);
    setVariantForm(emptyVariantForm);
    setVariantDialogOpen(true);
  };

  const openVariantEdit = (v: NonNullable<typeof variantsForEdit>[number]) => {
    setVariantEditingId(v.id);
    setVariantForm({
      nameTR: v.nameTR,
      nameEN: v.nameEN,
      nameAR: v.nameAR,
      sku: v.sku ?? "",
      price: v.price != null ? String(v.price) : "",
      stock: v.stock ?? 0,
      imageUrl: v.imageUrl ?? "",
      colorHex: v.colorHex ?? "",
      sortOrder: v.sortOrder ?? 0,
      isActive: v.isActive ?? true,
    });
    setVariantDialogOpen(true);
  };

  const saveVariant = () => {
    if (editingId === null) return;
    if (!variantForm.nameTR || !variantForm.nameEN || !variantForm.nameAR) {
      toast.error("Varyant için üç dilde isim zorunludur.");
      return;
    }
    const payload = {
      nameTR: variantForm.nameTR,
      nameEN: variantForm.nameEN,
      nameAR: variantForm.nameAR,
      sku: variantForm.sku || undefined,
      price: variantForm.price.trim() === "" ? null : variantForm.price,
      stock: variantForm.stock,
      imageUrl: variantForm.imageUrl || undefined,
      colorHex: variantForm.colorHex || undefined,
      sortOrder: variantForm.sortOrder,
      isActive: variantForm.isActive,
    };
    if (variantEditingId === null) {
      createVariantMutation.mutate({ productId: editingId, ...payload });
    } else {
      updateVariantMutation.mutate({ id: variantEditingId, ...payload });
    }
  };

  const openEdit = (product: NonNullable<typeof products>[number]) => {
    setEditingId(product.id);
    setForm({
      nameTR: product.nameTR,
      nameEN: product.nameEN,
      nameAR: product.nameAR,
      descriptionTR: product.descriptionTR ?? "",
      descriptionEN: product.descriptionEN ?? "",
      descriptionAR: product.descriptionAR ?? "",
      price: product.price,
      silhouetteId: product.silhouetteId ?? null,
      categoryId: product.categoryId ?? null,
      collection: product.collection ?? "",
      imageUrl: product.imageUrl ?? "",
      stock: product.stock ?? 0,
      isActive: product.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.nameTR || !form.nameEN || !form.nameAR || !form.price) {
      toast.error("Lütfen isim ve fiyat alanlarını doldurun.");
      return;
    }
    if (!form.silhouetteId) {
      toast.error("Lütfen bir silüet seçin.");
      return;
    }
    if (!form.categoryId) {
      toast.error("Lütfen bir kategori seçin.");
      return;
    }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate({ ...form, collection: form.collection || "" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
            Ürün Yönetimi
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
            Ürünler
          </h1>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Yeni Ürün
        </Button>
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

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !products?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Henüz ürün bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["İsim (TR)", "Silüet", "Kategori", "Fiyat", "Stok", "Durum", ""].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr
                    key={p.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium">{p.nameTR}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {silhouettes?.find(s => s.id === p.silhouetteId)?.nameTR ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {categories?.find(c => c.id === p.categoryId)?.nameTR ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">₺{Number(p.price).toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      {(() => {
                        const s = summaryByProductId.get(p.id);
                        if (s && s.count > 0) {
                          return (
                            <span className="tabular-nums" title="Efektif stok = aktif varyantların toplamı">
                              {s.totalStock}{" "}
                              <span className="text-muted-foreground text-xs">({s.count}v)</span>
                            </span>
                          );
                        }
                        return <span className="tabular-nums">{p.stock ?? 0}</span>;
                      })()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          p.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {p.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => {
                            setSerialDialog({ id: p.id, name: p.nameTR });
                            setSerialCount(Math.max(p.stock ?? 1, 1));
                            setSerialBatch("");
                            setSerialMaterial("");
                            setSerialProduction("");
                          }}
                          className="p-1.5 hover:bg-[#C9A96E]/10 rounded transition-colors text-muted-foreground hover:text-[#C9A96E]"
                          title="Seri No Üret"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">
              {editingId !== null ? "Ürünü Düzenle" : "Yeni Ürün"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {(["TR", "EN", "AR"] as const).map(lang => (
              <div key={lang} className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  İsim ({lang}) *
                </Label>
                <Input
                  value={form[`name${lang}` as keyof ProductFormData] as string}
                  onChange={e => setForm(f => ({ ...f, [`name${lang}`]: e.target.value }))}
                  placeholder={`Ürün adı (${lang})`}
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Fiyat (₺) *
              </Label>
              <Input
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Silüet *
              </Label>
              <select
                value={form.silhouetteId ?? ""}
                onChange={e => setForm(f => ({
                  ...f,
                  silhouetteId: e.target.value ? Number(e.target.value) : null,
                  categoryId: null,
                }))}
                className="flex h-9 w-full rounded border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Silüet seçin</option>
                {silhouettes?.filter(s => s.isActive).map(s => (
                  <option key={s.id} value={s.id}>{s.nameTR}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Kategori *
              </Label>
              <select
                value={form.categoryId ?? ""}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : null }))}
                className="flex h-9 w-full rounded border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={!form.silhouetteId}
              >
                <option value="">
                  {form.silhouetteId ? "Kategori seçin" : "Önce silüet seçin"}
                </option>
                {categories
                  ?.filter(c => c.isActive)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.nameTR}</option>
                  ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Sezon / Seri
              </Label>
              <Input
                value={form.collection}
                onChange={e => setForm(f => ({ ...f, collection: e.target.value }))}
                placeholder="örn. 2025 İlkbahar"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Stok
                {editingId !== null && variantCountForEdit > 0 ? (
                  <span className="ml-2 font-normal normal-case text-muted-foreground">
                    (varyantlı — ürün stoğu kullanılmaz)
                  </span>
                ) : null}
              </Label>
              <Input
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                type="number"
                min="0"
                disabled={editingId !== null && variantCountForEdit > 0}
                className={editingId !== null && variantCountForEdit > 0 ? "opacity-50" : ""}
              />
            </div>

            {editingId !== null ? (
              <div className="md:col-span-2 space-y-3 border border-border/40 rounded-md p-4 bg-muted/10">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-normal">
                    Varyantlar
                  </p>
                  <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={openVariantCreate}>
                    + Yeni Varyant
                  </Button>
                </div>
                {effectiveStockDisplay != null ? (
                  <p className="text-xs text-muted-foreground">
                    Efektif stok: <span className="font-medium text-foreground">{effectiveStockDisplay}</span>{" "}
                    (aktif varyantların toplamı)
                  </p>
                ) : null}
                <div className="rounded border border-border/30 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/40">
                        <th className="text-left p-2 font-normal text-muted-foreground">Görsel</th>
                        <th className="text-left p-2 font-normal text-muted-foreground">İsim (TR)</th>
                        <th className="text-left p-2 font-normal text-muted-foreground w-10">Renk</th>
                        <th className="text-right p-2 font-normal text-muted-foreground">Stok</th>
                        <th className="text-right p-2 w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {(variantsForEdit ?? []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-3 text-muted-foreground text-center">
                            Henüz varyant yok.
                          </td>
                        </tr>
                      ) : (
                        (variantsForEdit ?? []).map(v => (
                          <tr key={v.id} className="border-b border-border/20 last:border-0">
                            <td className="p-2 w-12">
                              {v.imageUrl ? (
                                <img src={v.imageUrl} alt="" className="h-9 w-9 rounded object-cover border" />
                              ) : (
                                <div className="h-9 w-9 rounded bg-muted border" />
                              )}
                            </td>
                            <td className="p-2 max-w-[140px] truncate">{v.nameTR}</td>
                            <td className="p-2">
                              {v.colorHex ? (
                                <span
                                  className="inline-block h-6 w-6 rounded-full border border-border"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-2 text-right tabular-nums">{v.stock}</td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                className="p-1 hover:bg-muted rounded text-muted-foreground"
                                onClick={() => openVariantEdit(v)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="p-1 hover:bg-destructive/10 rounded text-destructive"
                                onClick={() => {
                                  if (confirm("Bu varyantı silmek istediğinize emin misiniz?")) {
                                    deleteVariantMutation.mutate({ id: v.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="md:col-span-2">
              <ImageUpload
                value={form.imageUrl}
                onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
                label="Görsel"
              />
            </div>

            {(["TR", "EN", "AR"] as const).map(lang => (
              <div key={`desc-${lang}`} className="space-y-1.5 md:col-span-2">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Açıklama ({lang})
                </Label>
                <textarea
                  value={form[`description${lang}` as keyof ProductFormData] as string}
                  onChange={e => setForm(f => ({ ...f, [`description${lang}`]: e.target.value }))}
                  placeholder={`Açıklama (${lang})`}
                  rows={2}
                  className="flex w-full rounded border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
            ))}

            <div className="flex items-center gap-3 md:col-span-2">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
              />
              <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                Aktif — sitede görünür
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Kaydediliyor…" : editingId !== null ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">
              {variantEditingId === null ? "Yeni Varyant" : "Varyantı Düzenle"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {(["TR", "EN", "AR"] as const).map(lang => (
              <div key={`v-${lang}`}>
                <Label>İsim ({lang}) *</Label>
                <Input
                  className="mt-1"
                  value={variantForm[`name${lang}` as keyof VariantFormData] as string}
                  onChange={e =>
                    setVariantForm(f => ({ ...f, [`name${lang}`]: e.target.value } as VariantFormData))
                  }
                />
              </div>
            ))}
            <div>
              <Label>SKU</Label>
              <Input
                className="mt-1"
                value={variantForm.sku}
                onChange={e => setVariantForm(f => ({ ...f, sku: e.target.value }))}
              />
            </div>
            <div>
              <Label>Fiyat (₺) — boş bırakılırsa ürün fiyatı</Label>
              <Input
                className="mt-1"
                value={variantForm.price}
                onChange={e => setVariantForm(f => ({ ...f, price: e.target.value }))}
                placeholder="Ürün fiyatı"
              />
            </div>
            <div>
              <Label>Stok</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={variantForm.stock}
                onChange={e => setVariantForm(f => ({ ...f, stock: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
            <div>
              <Label>Sıra</Label>
              <Input
                className="mt-1"
                type="number"
                value={variantForm.sortOrder}
                onChange={e => setVariantForm(f => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
            <div>
              <Label>Renk (hex)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={variantForm.colorHex}
                  onChange={e => setVariantForm(f => ({ ...f, colorHex: e.target.value }))}
                  placeholder="#1C1C1E"
                  className="flex-1"
                />
                <input
                  type="color"
                  aria-label="Renk seç"
                  className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0"
                  value={variantForm.colorHex?.match(/^#[0-9A-Fa-f]{6}$/) ? variantForm.colorHex : "#1C1C1E"}
                  onChange={e => setVariantForm(f => ({ ...f, colorHex: e.target.value }))}
                />
              </div>
            </div>
            <ImageUpload
              value={variantForm.imageUrl}
              onChange={url => setVariantForm(f => ({ ...f, imageUrl: url }))}
              label="Görsel"
            />
            <div className="flex items-center gap-2">
              <Switch
                id="v-active"
                checked={variantForm.isActive}
                onCheckedChange={v => setVariantForm(f => ({ ...f, isActive: v }))}
              />
              <Label htmlFor="v-active">Aktif</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={() => setVariantDialogOpen(false)}>
              İptal
            </Button>
            <Button
              type="button"
              onClick={saveVariant}
              disabled={createVariantMutation.isPending || updateVariantMutation.isPending}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Serial Generate Dialog */}
      <Dialog
        open={serialDialog !== null}
        onOpenChange={open => {
          if (!open) setSerialDialog(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">
              Seri Numarası Üret
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-[#C9A96E]/5 border border-[#C9A96E]/20 rounded px-4 py-3">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">
                Ürün
              </p>
              <p className="font-medium text-sm">{serialDialog?.name}</p>
              <p className="text-xs text-muted-foreground mt-1.5 font-['Cormorant_Garamond'] italic">
                Format: VL-{new Date().getFullYear()}-00001, 00002, …
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Adet * (1–500)
              </Label>
              <Input
                type="number"
                min="1"
                max="500"
                value={serialCount}
                onChange={e => setSerialCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Parti No
              </Label>
              <Input
                value={serialBatch}
                onChange={e => setSerialBatch(e.target.value)}
                placeholder={`örn. VL-${new Date().getFullYear()}-003`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Üretim
                </Label>
                <Input
                  value={serialProduction}
                  onChange={e => setSerialProduction(e.target.value)}
                  placeholder="Şubat 2026"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                  Kumaş
                </Label>
                <Input
                  value={serialMaterial}
                  onChange={e => setSerialMaterial(e.target.value)}
                  placeholder="%100 Yün"
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground font-['Cormorant_Garamond'] italic leading-relaxed">
              Üretim sonrası seriler "Doğrulama" sayfasında görünür. QR kodları oradan indirilebilir.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSerialDialog(null)}>
              İptal
            </Button>
            <Button
              onClick={() => {
                if (!serialDialog) return;
                generateSerialsMutation.mutate({
                  productId: serialDialog.id,
                  count: serialCount,
                  batchNumber: serialBatch.trim() || undefined,
                  productionDate: serialProduction.trim() || undefined,
                  material: serialMaterial.trim() || undefined,
                });
              }}
              disabled={generateSerialsMutation.isPending}
            >
              {generateSerialsMutation.isPending
                ? "Üretiliyor…"
                : `${serialCount} Adet Üret`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ürünü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
