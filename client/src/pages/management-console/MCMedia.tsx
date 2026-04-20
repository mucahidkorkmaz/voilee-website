import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Copy, ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type UploadMode = "file" | "url";
type MediaForm = { url: string; filename: string; alt: string; };
const emptyForm: MediaForm = { url: "", filename: "", alt: "" };

export default function MCMedia() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.media.list.useQuery(undefined, { retry: false });
  const addMutation = trpc.admin.media.add.useMutation({
    onSuccess: () => {
      utils.admin.media.list.invalidate();
      toast.success("Medya eklendi.");
      setOpen(false);
      setForm(emptyForm);
      setMode("file");
    },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.media.delete.useMutation({
    onSuccess: () => { utils.admin.media.list.invalidate(); toast.success("Medya silindi."); setDeleteId(null); },
    onError: e => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<MediaForm>(emptyForm);
  const [mode, setMode] = useState<UploadMode>("file");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece görsel dosyaları yüklenebilir.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Dosya boyutu 15 MB sınırını aşıyor.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Yükleme başarısız.");
      }
      const result = await res.json();
      const name = form.filename || file.name;
      addMutation.mutate({ url: result.url, filename: name, alt: form.alt || undefined });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleAddUrl = () => {
    if (!form.url) { toast.error("URL zorunludur."); return; }
    const name = form.filename || form.url.split("/").pop() || "media";
    addMutation.mutate({ url: form.url, filename: name, alt: form.alt || undefined });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => toast.success("URL kopyalandı."));
  };

  const isPending = uploading || addMutation.isPending;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Katalog</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Medya</h1>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />Görsel Ekle
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Medya yüklenemedi.</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse rounded" />)}
        </div>
      ) : !data?.length ? (
        <div className="border border-dashed border-border/60 rounded p-16 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Henüz medya eklenmemiş.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Dosya yükleyerek veya URL ekleyerek medya kütüphanenizi oluşturun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map(item => (
            <div key={item.id} className="group relative aspect-square bg-muted rounded border border-border/30 overflow-hidden">
              <img src={item.url} alt={item.alt ?? item.filename ?? ""} className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => copyUrl(item.url)} className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors" title="URL'yi kopyala"><Copy className="h-4 w-4" /></button>
                <button onClick={() => setDeleteId(item.id)} className="p-2 bg-white/10 hover:bg-destructive/80 rounded text-white transition-colors" title="Sil"><Trash2 className="h-4 w-4" /></button>
              </div>
              {item.filename && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <p className="text-[10px] text-white truncate">{item.filename}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setForm(emptyForm); setMode("file"); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">Medya Ekle</DialogTitle>
          </DialogHeader>

          {/* Mode Tabs */}
          <div className="flex rounded border border-border/50 overflow-hidden text-sm">
            <button
              onClick={() => setMode("file")}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${mode === "file" ? "bg-foreground text-background" : "hover:bg-muted"}`}
            >
              <Upload className="h-3.5 w-3.5" />Dosya Yükle
            </button>
            <button
              onClick={() => setMode("url")}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${mode === "url" ? "bg-foreground text-background" : "hover:bg-muted"}`}
            >
              <ImageIcon className="h-3.5 w-3.5" />URL Ekle
            </button>
          </div>

          <div className="space-y-4 py-2">
            {mode === "file" ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div
                  onClick={() => !isPending && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className={[
                    "flex flex-col items-center justify-center gap-3 rounded border-2 border-dashed cursor-pointer transition-colors py-10",
                    dragOver ? "border-primary bg-primary/5" : "border-border/50 hover:border-border hover:bg-muted/40",
                    isPending ? "pointer-events-none opacity-60" : "",
                  ].filter(Boolean).join(" ")}
                >
                  {isPending ? (
                    <div className="w-7 h-7 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground/40" />
                  )}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {isPending ? "Yükleniyor…" : "Tıkla veya sürükle-bırak"}
                    </p>
                    {!isPending && (
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        JPEG, PNG, WebP, GIF, SVG · maks. 15 MB
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Alt Metin (opsiyonel)</Label>
                  <Input value={form.alt} onChange={e => setForm(f => ({ ...f, alt: e.target.value }))} placeholder="Görsel açıklaması" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Görsel URL *</Label>
                  <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://example.com/image.jpg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Dosya Adı</Label>
                  <Input value={form.filename} onChange={e => setForm(f => ({ ...f, filename: e.target.value }))} placeholder="urun-gorseli.jpg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Alt Metin</Label>
                  <Input value={form.alt} onChange={e => setForm(f => ({ ...f, alt: e.target.value }))} placeholder="Görsel açıklaması" />
                </div>
                {form.url && (
                  <div className="rounded border border-border/50 overflow-hidden aspect-video bg-muted">
                    <img src={form.url} alt="Önizleme" className="h-full w-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </>
            )}
          </div>

          {mode === "url" && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
              <Button onClick={handleAddUrl} disabled={addMutation.isPending}>
                {addMutation.isPending ? "Ekleniyor…" : "Ekle"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Medyayı Sil</AlertDialogTitle>
            <AlertDialogDescription>Bu medya öğesini kütüphaneden kaldırmak istiyor musunuz?</AlertDialogDescription>
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
