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
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  collection: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
};

const emptyForm: ProductFormData = {
  nameTR: "",
  nameEN: "",
  nameAR: "",
  descriptionTR: "",
  descriptionEN: "",
  descriptionAR: "",
  price: "",
  collection: "",
  imageUrl: "",
  stock: 0,
  isActive: true,
};

export default function MCProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading, error } = trpc.admin.products.list.useQuery(undefined, { retry: false });
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
  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      utils.admin.stats.invalidate();
      toast.success("Ürün silindi.");
      setDeleteId(null);
    },
    onError: e => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
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
      collection: product.collection,
      imageUrl: product.imageUrl ?? "",
      stock: product.stock ?? 0,
      isActive: product.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.nameTR || !form.nameEN || !form.nameAR || !form.price || !form.collection) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
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
                  {["İsim (TR)", "Koleksiyon", "Fiyat", "Stok", "Durum", ""].map(h => (
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
                    <td className="px-5 py-3.5 text-muted-foreground">{p.collection}</td>
                    <td className="px-5 py-3.5">₺{Number(p.price).toFixed(2)}</td>
                    <td className="px-5 py-3.5">{p.stock}</td>
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
                Koleksiyon *
              </Label>
              <Input
                value={form.collection}
                onChange={e => setForm(f => ({ ...f, collection: e.target.value }))}
                placeholder="örn. Sonbahar 2025"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Stok
              </Label>
              <Input
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                type="number"
                min="0"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Görsel URL
              </Label>
              <Input
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
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
