import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

type HeroSlideForm = {
  imgUrl: string;
  imgUrlMobile: string;
  duration: number;
  linkUrl: string;
  tagTR: string;
  tagEN: string;
  tagAR: string;
  titleTR: string;
  titleEN: string;
  titleAR: string;
  subtitleTR: string;
  subtitleEN: string;
  subtitleAR: string;
  ctaLabelTR: string;
  ctaLabelEN: string;
  ctaLabelAR: string;
  ctaHrefTR: string;
  ctaHrefEN: string;
  ctaHrefAR: string;
  ctaVisible: boolean;
  secLabelTR: string;
  secLabelEN: string;
  secLabelAR: string;
  secHrefTR: string;
  secHrefEN: string;
  secHrefAR: string;
  secVisible: boolean;
  sortOrder: number;
  isActive: boolean;
};

const formSchema = z.object({
  imgUrl: z.string().min(1, "Görsel URL zorunludur."),
  imgUrlMobile: z.string().max(500).optional(),
  duration: z.number().min(1000).max(30000).default(6000),
  linkUrl: z.string().max(500).optional(),
  tagTR: z.string(),
  tagEN: z.string(),
  tagAR: z.string(),
  titleTR: z.string(),
  titleEN: z.string(),
  titleAR: z.string(),
  subtitleTR: z.string(),
  subtitleEN: z.string(),
  subtitleAR: z.string(),
  ctaLabelTR: z.string(),
  ctaLabelEN: z.string(),
  ctaLabelAR: z.string(),
  ctaHrefTR: z.string(),
  ctaHrefEN: z.string(),
  ctaHrefAR: z.string(),
  ctaVisible: z.boolean(),
  secLabelTR: z.string(),
  secLabelEN: z.string(),
  secLabelAR: z.string(),
  secHrefTR: z.string(),
  secHrefEN: z.string(),
  secHrefAR: z.string(),
  secVisible: z.boolean(),
  sortOrder: z.number(),
  isActive: z.boolean(),
});

const emptyForm: HeroSlideForm = {
  imgUrl: "",
  imgUrlMobile: "",
  duration: 6000,
  linkUrl: "",
  tagTR: "",
  tagEN: "",
  tagAR: "",
  titleTR: "",
  titleEN: "",
  titleAR: "",
  subtitleTR: "",
  subtitleEN: "",
  subtitleAR: "",
  ctaLabelTR: "Koleksiyonu Keşfet",
  ctaLabelEN: "Explore Collection",
  ctaLabelAR: "استكشف المجموعة",
  ctaHrefTR: "/koleksiyonlar",
  ctaHrefEN: "/en/collections",
  ctaHrefAR: "/ar/collections",
  ctaVisible: true,
  secLabelTR: "Hikayemiz",
  secLabelEN: "Our Story",
  secLabelAR: "Our Story",
  secHrefTR: "/hakkimizda",
  secHrefEN: "/en/about",
  secHrefAR: "/ar/about",
  secVisible: true,
  sortOrder: 0,
  isActive: true,
};

const toBoolean = (value: unknown): boolean => value === true || value === 1 || value === "true" || value === "1";

export default function MCHeroSlides() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.heroSlides.list.useQuery(undefined, { retry: false });
  const createMutation = trpc.admin.heroSlides.create.useMutation({
    onSuccess: () => {
      utils.admin.heroSlides.list.invalidate();
      utils.heroSlides.list.invalidate();
      toast.success("Slayt oluşturuldu.");
      setOpen(false);
      setForm(emptyForm);
    },
    onError: e => toast.error(e.message),
  });
  const updateMutation = trpc.admin.heroSlides.update.useMutation({
    onSuccess: () => {
      utils.admin.heroSlides.list.invalidate();
      utils.heroSlides.list.invalidate();
      toast.success("Slayt güncellendi.");
      setOpen(false);
      setEditId(null);
    },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.heroSlides.delete.useMutation({
    onSuccess: () => {
      utils.admin.heroSlides.list.invalidate();
      utils.heroSlides.list.invalidate();
      toast.success("Slayt silindi.");
      setDeleteId(null);
    },
    onError: e => toast.error(e.message),
  });
  const reorderMutation = trpc.admin.heroSlides.reorder.useMutation({
    onSuccess: () => {
      utils.admin.heroSlides.list.invalidate();
      utils.heroSlides.list.invalidate();
      toast.success("Sıralama güncellendi.");
    },
    onError: e => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<HeroSlideForm>(emptyForm);
  const [activeLang, setActiveLang] = useState<"TR" | "EN" | "AR">("TR");

  const set = (k: keyof HeroSlideForm, v: string | boolean | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditId(null);
    setForm({
      ...emptyForm,
      sortOrder: data?.length ?? 0,
    });
    setActiveLang("TR");
    setOpen(true);
  };

  const openEdit = (slide: NonNullable<typeof data>[number]) => {
    console.log("SLIDE RAW:", JSON.stringify(slide));
    console.log("ctaVisible type:", typeof slide.ctaVisible, "value:", slide.ctaVisible);
    console.log("secVisible type:", typeof slide.secVisible, "value:", slide.secVisible);

    setEditId(slide.id);
    setForm({
      imgUrl: slide.imgUrl,
      imgUrlMobile: slide.imgUrlMobile ?? "",
      duration: slide.duration ?? 6000,
      linkUrl: slide.linkUrl ?? "",
      tagTR: slide.tagTR,
      tagEN: slide.tagEN,
      tagAR: slide.tagAR,
      titleTR: slide.titleTR,
      titleEN: slide.titleEN,
      titleAR: slide.titleAR,
      subtitleTR: slide.subtitleTR,
      subtitleEN: slide.subtitleEN,
      subtitleAR: slide.subtitleAR,
      ctaLabelTR: slide.ctaLabelTR,
      ctaLabelEN: slide.ctaLabelEN,
      ctaLabelAR: slide.ctaLabelAR,
      ctaHrefTR: slide.ctaHrefTR,
      ctaHrefEN: slide.ctaHrefEN,
      ctaHrefAR: slide.ctaHrefAR,
      ctaVisible: toBoolean(slide.ctaVisible),
      secLabelTR: slide.secLabelTR,
      secLabelEN: slide.secLabelEN,
      secLabelAR: slide.secLabelAR,
      secHrefTR: slide.secHrefTR,
      secHrefEN: slide.secHrefEN,
      secHrefAR: slide.secHrefAR,
      secVisible: toBoolean(slide.secVisible),
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
    setActiveLang("TR");
    setOpen(true);
  };

  const handleSubmit = () => {
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Lütfen form alanlarını kontrol edin.");
      return;
    }
    if (editId !== null) {
      console.log("SAVE PAYLOAD ctaVisible:", form.ctaVisible, typeof form.ctaVisible);
      console.log("SAVE PAYLOAD secVisible:", form.secVisible, typeof form.secVisible);
      console.log("FULL PAYLOAD:", JSON.stringify(form));
      updateMutation.mutate({ id: editId, ...parsed.data });
    }
    else createMutation.mutate(parsed.data);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    if (!data?.length) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= data.length) return;
    const reordered = [...data];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    reorderMutation.mutate(reordered.map((item, i) => ({ id: item.id, sortOrder: i })));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Katalog</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Hero Slaytlar</h1>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Yeni Slayt Ekle</Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error.message.includes("10002") ? "Bu verilere erişmek için admin yetkisi gereklidir." : error.message.includes("10001") ? "Giriş yapmanız gereklidir." : "Veritabanı bağlantısı kurulamadı."}</p>
        </div>
      )}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
          </div>
        ) : !data?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Henüz hero slaytı bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-border/30">
            {data.map((slide, index) => (
              <div key={slide.id} className="px-4 py-3 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                <div className="text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
                {slide.imgUrl ? (
                  <img src={slide.imgUrl} alt={slide.titleTR} className="h-14 w-24 object-cover rounded border border-border/30" />
                ) : (
                  <div className="h-14 w-24 bg-muted rounded border border-border/30" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{slide.titleTR || "Başlıksız slayt"}</p>
                  <p className="text-xs text-muted-foreground">Sıra: {slide.sortOrder}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${slide.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {slide.isActive ? "Aktif" : "Pasif"}
                </span>
                <div className="flex items-center gap-1">
                  <button disabled={reorderMutation.isPending} onClick={() => moveItem(index, -1)} className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40" aria-label="Yukarı taşı">
                    ↑
                  </button>
                  <button disabled={reorderMutation.isPending} onClick={() => moveItem(index, 1)} className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40" aria-label="Aşağı taşı">
                    ↓
                  </button>
                  <button onClick={() => openEdit(slide)} className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(slide.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">{editId !== null ? "Slaytı Düzenle" : "Yeni Slayt Ekle"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2">
              <ImageUpload
                label="Hero Görseli *"
                value={form.imgUrl}
                onChange={url => setForm(f => ({ ...f, imgUrl: url }))}
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Mobil Görsel (opsiyonel)"
                value={form.imgUrlMobile}
                onChange={(url) => setForm((f) => ({ ...f, imgUrlMobile: url }))}
              />
              <p className="text-xs text-muted-foreground -mt-2">
                Mobil cihazlarda gösterilecek dikey görsel. Boş bırakılırsa
                masaüstü görseli kullanılır.
              </p>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Hero Tıklama Linki
              </Label>
              <Input
                value={form.linkUrl ?? ""}
                onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/koleksiyonlar"
              />
              <p className="text-xs text-muted-foreground">
                Görselin herhangi bir yerine tıklanınca bu adrese yönlendirir.
                Boş bırakılırsa hero tıklanamaz olur.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Sıralama</Label>
              <Input type="number" value={form.sortOrder} onChange={e => set("sortOrder", parseInt(e.target.value, 10) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">
                Gösterim Süresi (saniye)
              </Label>
              <Input
                type="number"
                min={1}
                max={30}
                step={0.5}
                value={form.duration / 1000}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  duration: Math.round(parseFloat(e.target.value || "6") * 1000),
                }))}
                placeholder="6"
              />
              <p className="text-xs text-muted-foreground">
                Bu slaytın ekranda kalma süresi (1-30 saniye arası).
              </p>
            </div>
            <div className="flex items-center gap-3 pt-7">
              <Switch id="hero-active" checked={form.isActive} onCheckedChange={v => set("isActive", v)} />
              <Label htmlFor="hero-active" className="text-sm font-normal cursor-pointer">Aktif — ana sayfada görünür</Label>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border border-border/40 rounded p-3 space-y-2">
                  <p className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ana Buton</p>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.ctaVisible}
                      onCheckedChange={v => setForm(f => ({ ...f, ctaVisible: v }))}
                    />
                    <Label className="text-xs text-muted-foreground">Goster</Label>
                  </div>
                </div>
                <div className="border border-border/40 rounded p-3 space-y-2">
                  <p className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ikincil Buton</p>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.secVisible}
                      onCheckedChange={v => setForm(f => ({ ...f, secVisible: v }))}
                    />
                    <Label className="text-xs text-muted-foreground">Goster</Label>
                  </div>
                </div>
              </div>
              <Tabs value={activeLang} onValueChange={v => setActiveLang(v as "TR" | "EN" | "AR")}>
                <TabsList>
                  <TabsTrigger value="TR">TR</TabsTrigger>
                  <TabsTrigger value="EN">EN</TabsTrigger>
                  <TabsTrigger value="AR">AR</TabsTrigger>
                </TabsList>
                {(["TR", "EN", "AR"] as const).map(lang => (
                  <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Tag ({lang})</Label>
                      <Input value={form[`tag${lang}` as keyof HeroSlideForm] as string} onChange={e => set(`tag${lang}` as keyof HeroSlideForm, e.target.value)} placeholder="Yeni Koleksiyon" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Başlık ({lang})</Label>
                      <textarea value={form[`title${lang}` as keyof HeroSlideForm] as string} onChange={e => set(`title${lang}` as keyof HeroSlideForm, e.target.value)} rows={3}
                        className="flex w-full rounded border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Alt Başlık ({lang})</Label>
                      <textarea value={form[`subtitle${lang}` as keyof HeroSlideForm] as string} onChange={e => set(`subtitle${lang}` as keyof HeroSlideForm, e.target.value)} rows={3}
                        className="flex w-full rounded border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
                    </div>
                    <div className="border-t border-border/40 pt-4 space-y-3">
                      <p className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ana Buton</p>
                      <Input
                        value={form[`ctaLabel${lang}` as keyof HeroSlideForm] as string}
                        onChange={e => set(`ctaLabel${lang}` as keyof HeroSlideForm, e.target.value)}
                        placeholder={lang === "TR" ? "Koleksiyonu Kesfet" : lang === "EN" ? "Explore Collection" : "استكشف المجموعة"}
                        disabled={!form.ctaVisible}
                      />
                      <Input
                        value={form[`ctaHref${lang}` as keyof HeroSlideForm] as string}
                        onChange={e => set(`ctaHref${lang}` as keyof HeroSlideForm, e.target.value)}
                        placeholder={lang === "TR" ? "/koleksiyonlar" : lang === "EN" ? "/en/collections" : "/ar/collections"}
                        disabled={!form.ctaVisible}
                      />
                    </div>
                    <div className="border-t border-border/40 pt-4 space-y-3">
                      <p className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ikincil Buton</p>
                      <Input
                        value={form[`secLabel${lang}` as keyof HeroSlideForm] as string}
                        onChange={e => set(`secLabel${lang}` as keyof HeroSlideForm, e.target.value)}
                        placeholder={lang === "TR" ? "Hikayemiz" : "Our Story"}
                        disabled={!form.secVisible}
                      />
                      <Input
                        value={form[`secHref${lang}` as keyof HeroSlideForm] as string}
                        onChange={e => set(`secHref${lang}` as keyof HeroSlideForm, e.target.value)}
                        placeholder={lang === "TR" ? "/hakkimizda" : lang === "EN" ? "/en/about" : "/ar/about"}
                        disabled={!form.secVisible}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={handleSubmit} disabled={isPending}>{isPending ? "Kaydediliyor…" : editId !== null ? "Güncelle" : "Kaydet"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slaytı Sil</AlertDialogTitle>
            <AlertDialogDescription>Bu slaytı kalıcı olarak silmek istiyor musunuz?</AlertDialogDescription>
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
