import { useState } from "react";
import {
  AlertCircle,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type VerificationForm = {
  serialNumber: string;
  productId: number | null;
  productNameTR: string;
  productNameEN: string;
  productNameAR: string;
  collection: string;
  collectionYear: string;
  batchNumber: string;
  productionDate: string;
  material: string;
  imageUrl: string;
  orderNumber: string;
  status: "unowned" | "registered" | "transferring";
  ownerName: string;
  ownerEmail: string;
  isActive: boolean;
};

const emptyForm: VerificationForm = {
  serialNumber: "",
  productId: null,
  productNameTR: "",
  productNameEN: "",
  productNameAR: "",
  collection: "",
  collectionYear: "",
  batchNumber: "",
  productionDate: "",
  material: "",
  imageUrl: "",
  orderNumber: "",
  status: "unowned",
  ownerName: "",
  ownerEmail: "",
  isActive: true,
};

const statusLabel: Record<VerificationForm["status"], string> = {
  unowned: "Sahipsiz",
  registered: "Tescilli",
  transferring: "Devir sürecinde",
};

const statusBadge: Record<VerificationForm["status"], string> = {
  unowned: "bg-zinc-100 text-zinc-600",
  registered: "bg-emerald-100 text-emerald-700",
  transferring: "bg-amber-100 text-amber-700",
};

function verificationUrl(serial: string) {
  return `${window.location.origin}/dogrulama/${serial}`;
}

async function renderQrDataUrl(text: string) {
  return QRCode.toDataURL(text, {
    margin: 2,
    scale: 8,
    color: { dark: "#1C1C1E", light: "#FFFFFF" },
  });
}

async function downloadQrPng(serial: string) {
  const dataUrl = await renderQrDataUrl(verificationUrl(serial));
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `VOILEE-QR-${serial}.png`;
  link.click();
}

async function downloadBulkPdf(serials: string[]) {
  if (serials.length === 0) return;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const cols = 3;
  const rows = 4;
  const perPage = cols * rows;
  const marginX = 15;
  const marginY = 18;
  const cellW = (210 - marginX * 2) / cols; // 60mm
  const cellH = (297 - marginY * 2) / rows; // ~65mm
  const qrSize = 42;

  for (let i = 0; i < serials.length; i++) {
    const serial = serials[i];
    if (i > 0 && i % perPage === 0) pdf.addPage();
    const idxInPage = i % perPage;
    const col = idxInPage % cols;
    const row = Math.floor(idxInPage / cols);
    const x = marginX + col * cellW;
    const y = marginY + row * cellH;

    const qrX = x + (cellW - qrSize) / 2;
    const qrY = y + 4;
    const dataUrl = await renderQrDataUrl(verificationUrl(serial));
    pdf.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    pdf.text("VOILÉE · Orijinallik", x + cellW / 2, qrY + qrSize + 4, { align: "center" });

    pdf.setFont("courier", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(28);
    pdf.text(serial, x + cellW / 2, qrY + qrSize + 10, { align: "center" });

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7);
    pdf.setTextColor(150);
    pdf.text(verificationUrl(serial), x + cellW / 2, qrY + qrSize + 14, {
      align: "center",
      maxWidth: cellW - 4,
    });
  }

  pdf.save(`VOILEE-QR-Etiketler-${Date.now()}.pdf`);
}

export default function MCVerifications() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.verifications.list.useQuery(undefined, { retry: false });
  const { data: products } = trpc.admin.products.list.useQuery(undefined, { retry: false });

  const createMutation = trpc.admin.verifications.create.useMutation({
    onSuccess: () => {
      utils.admin.verifications.list.invalidate();
      toast.success("Doğrulama kaydı oluşturuldu.");
      setOpen(false);
      setForm(emptyForm);
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.admin.verifications.update.useMutation({
    onSuccess: () => {
      utils.admin.verifications.list.invalidate();
      toast.success("Kayıt güncellendi.");
      setOpen(false);
      setEditId(null);
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.verifications.delete.useMutation({
    onSuccess: () => {
      utils.admin.verifications.list.invalidate();
      toast.success("Kayıt silindi.");
      setDeleteId(null);
    },
    onError: e => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<VerificationForm>(emptyForm);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [qrPreview, setQrPreview] = useState<{ serial: string; productName: string | null; collection: string | null; dataUrl: string } | null>(null);
  const [isBulkExporting, setBulkExporting] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = (items: NonNullable<typeof data>) => {
    setSelectedIds(prev => {
      if (prev.size === items.length) return new Set();
      return new Set(items.map(i => i.id));
    });
  };

  const openQrPreview = async (v: NonNullable<typeof data>[number]) => {
    try {
      const dataUrl = await renderQrDataUrl(verificationUrl(v.serialNumber));
      setQrPreview({
        serial: v.serialNumber,
        productName: v.productNameTR ?? null,
        collection: [v.collection, v.collectionYear].filter(Boolean).join(" · ") || null,
        dataUrl,
      });
    } catch {
      toast.error("QR üretilemedi.");
    }
  };

  const handleBulkPdf = async () => {
    if (!data) return;
    const list = selectedIds.size > 0
      ? data.filter(v => selectedIds.has(v.id))
      : data;
    if (list.length === 0) {
      toast.error("Önce kayıt seçin.");
      return;
    }
    setBulkExporting(true);
    try {
      await downloadBulkPdf(list.map(v => v.serialNumber));
      toast.success(`${list.length} adet QR etiket PDF olarak indirildi.`);
    } catch {
      toast.error("PDF üretilemedi.");
    } finally {
      setBulkExporting(false);
    }
  };

  const set = <K extends keyof VerificationForm>(k: K, v: VerificationForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (v: NonNullable<typeof data>[number]) => {
    setEditId(v.id);
    setForm({
      serialNumber: v.serialNumber,
      productId: v.productId ?? null,
      productNameTR: v.productNameTR ?? "",
      productNameEN: v.productNameEN ?? "",
      productNameAR: v.productNameAR ?? "",
      collection: v.collection ?? "",
      collectionYear: v.collectionYear ?? "",
      batchNumber: v.batchNumber ?? "",
      productionDate: v.productionDate ?? "",
      material: v.material ?? "",
      imageUrl: v.imageUrl ?? "",
      orderNumber: v.orderNumber ?? "",
      status: v.status,
      ownerName: v.ownerName ?? "",
      ownerEmail: v.ownerEmail ?? "",
      isActive: v.isActive ?? true,
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.serialNumber.trim()) {
      toast.error("Seri numarası zorunludur.");
      return;
    }
    const payload = {
      serialNumber: form.serialNumber.trim(),
      productId: form.productId,
      productNameTR: form.productNameTR || undefined,
      productNameEN: form.productNameEN || undefined,
      productNameAR: form.productNameAR || undefined,
      collection: form.collection || undefined,
      collectionYear: form.collectionYear || undefined,
      batchNumber: form.batchNumber || undefined,
      productionDate: form.productionDate || undefined,
      material: form.material || undefined,
      imageUrl: form.imageUrl || undefined,
      orderNumber: form.orderNumber || undefined,
      isActive: form.isActive,
    };
    if (editId !== null) {
      updateMutation.mutate({
        id: editId,
        ...payload,
        status: form.status,
        ownerName: form.ownerName || undefined,
        ownerEmail: form.ownerEmail || undefined,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const copyLink = (serial: string) => {
    const url = `${window.location.origin}/dogrulama/${serial}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Doğrulama bağlantısı panoya kopyalandı."),
      () => toast.error("Bağlantı kopyalanamadı."),
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Katalog</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Doğrulama Kayıtları</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Seri numaralı parçalar için /dogrulama sayfasında gösterilecek kayıtları yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleBulkPdf}
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={isBulkExporting || !data?.length}
            title={selectedIds.size > 0 ? `${selectedIds.size} seçili kayıt için PDF` : "Tüm kayıtlar için PDF"}
          >
            <FileText className="h-4 w-4" />
            {isBulkExporting
              ? "Hazırlanıyor…"
              : selectedIds.size > 0
              ? `${selectedIds.size} Seçili QR PDF`
              : "Tümünün QR PDF'i"}
          </Button>
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />Yeni Kayıt
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Veri yüklenemedi.</p>
        </div>
      )}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !data?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Henüz doğrulama kaydı bulunmuyor. İlk kaydı oluşturmak için "Yeni Kayıt" düğmesine tıklayın.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="accent-[#C9A96E] h-3.5 w-3.5"
                      checked={data.length > 0 && selectedIds.size === data.length}
                      onChange={() => toggleAll(data)}
                    />
                  </th>
                  {["Seri", "Parça", "Koleksiyon", "Parti", "Durum", "Sahip", "Tarama", ""].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(v => (
                  <tr
                    key={v.id}
                    className={`border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors ${
                      selectedIds.has(v.id) ? "bg-[#C9A96E]/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        className="accent-[#C9A96E] h-3.5 w-3.5"
                        checked={selectedIds.has(v.id)}
                        onChange={() => toggleSelect(v.id)}
                      />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs tracking-widest">{v.serialNumber}</td>
                    <td className="px-5 py-3.5">{v.productNameTR || "—"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {v.collection ?? "—"}
                      {v.collectionYear ? ` · ${v.collectionYear}` : ""}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{v.batchNumber ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge[v.status]}`}>
                        {statusLabel[v.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {v.ownerName ? (
                        <div className="flex flex-col leading-tight">
                          <span className="text-foreground">{v.ownerName}</span>
                          {v.ownerEmail && <span className="text-[11px] text-muted-foreground/80">{v.ownerEmail}</span>}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">{v.scanCount ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openQrPreview(v)}
                          title="QR kodunu görüntüle / indir"
                          className="p-1.5 hover:bg-[#C9A96E]/10 rounded transition-colors text-muted-foreground hover:text-[#C9A96E]"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => copyLink(v.serialNumber)}
                          title="Bağlantıyı kopyala"
                          className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={`/dogrulama/${v.serialNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Doğrulama sayfasını aç"
                          className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(v.id)}
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

      <Dialog
        open={open}
        onOpenChange={v => {
          setOpen(v);
          if (!v) {
            setEditId(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">
              {editId !== null ? "Kaydı Düzenle" : "Yeni Doğrulama Kaydı"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Seri Numarası *</Label>
              <Input
                value={form.serialNumber}
                onChange={e => set("serialNumber", e.target.value)}
                placeholder="Örn. 00147"
                className="font-mono tracking-widest"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ürün (opsiyonel eşleştirme)</Label>
              <Select
                value={form.productId !== null ? String(form.productId) : "none"}
                onValueChange={v => {
                  if (v === "none") {
                    set("productId", null);
                    return;
                  }
                  const id = Number(v);
                  set("productId", id);
                  const p = products?.find(p => p.id === id);
                  if (p) {
                    if (!form.productNameTR) set("productNameTR", p.nameTR);
                    if (!form.productNameEN) set("productNameEN", p.nameEN);
                    if (!form.productNameAR) set("productNameAR", p.nameAR);
                    if (!form.collection && p.collection) set("collection", p.collection);
                    if (!form.imageUrl && p.imageUrl) set("imageUrl", p.imageUrl);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ürün seçin veya boş bırakın" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Bağımsız kayıt —</SelectItem>
                  {products?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nameTR}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ürün Adı · TR</Label>
              <Input value={form.productNameTR} onChange={e => set("productNameTR", e.target.value)} placeholder="Ekru Palto" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ürün Adı · EN</Label>
              <Input value={form.productNameEN} onChange={e => set("productNameEN", e.target.value)} placeholder="Ecru Coat" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ürün Adı · AR</Label>
              <Input value={form.productNameAR} onChange={e => set("productNameAR", e.target.value)} placeholder="معطف" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Koleksiyon</Label>
              <Input value={form.collection} onChange={e => set("collection", e.target.value)} placeholder="Kış Koleksiyonu" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Yıl</Label>
              <Input value={form.collectionYear} onChange={e => set("collectionYear", e.target.value)} placeholder="2026" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Parti No</Label>
              <Input value={form.batchNumber} onChange={e => set("batchNumber", e.target.value)} placeholder="VL · 2026 · 003" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Üretim</Label>
              <Input value={form.productionDate} onChange={e => set("productionDate", e.target.value)} placeholder="Şubat 2026" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Kumaş / Materyal</Label>
              <Input value={form.material} onChange={e => set("material", e.target.value)} placeholder="%100 Yün — Biella" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Görsel</Label>
              <ImageUpload value={form.imageUrl} onChange={url => set("imageUrl", url)} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Eşleşen Sipariş Numarası (opsiyonel)</Label>
              <Input value={form.orderNumber} onChange={e => set("orderNumber", e.target.value)} placeholder="12847" />
            </div>

            {editId !== null && (
              <>
                <div className="col-span-2 pt-2 border-t border-border/40" />

                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Durum</Label>
                  <Select value={form.status} onValueChange={v => set("status", v as VerificationForm["status"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unowned">Sahipsiz</SelectItem>
                      <SelectItem value="registered">Tescilli</SelectItem>
                      <SelectItem value="transferring">Devir sürecinde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Sahip Adı</Label>
                  <Input value={form.ownerName} onChange={e => set("ownerName", e.target.value)} placeholder="Elif A." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Sahip E-posta</Label>
                  <Input value={form.ownerEmail} onChange={e => set("ownerEmail", e.target.value)} placeholder="elif@example.com" />
                </div>
              </>
            )}

            <div className="col-span-2 flex items-center gap-3 pt-2">
              <Switch id="ver-active" checked={form.isActive} onCheckedChange={v => set("isActive", v)} />
              <Label htmlFor="ver-active" className="text-sm font-normal cursor-pointer">Aktif</Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending
                ? "Kaydediliyor…"
                : editId !== null
                ? "Güncelle"
                : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Preview */}
      <Dialog open={qrPreview !== null} onOpenChange={v => !v && setQrPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">
              Orijinallik QR Kodu
            </DialogTitle>
          </DialogHeader>
          {qrPreview && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="border border-[#C9A96E]/30 bg-white p-6 relative">
                <span className="absolute -top-px left-6 w-10 h-0.5 bg-[#C9A96E]" />
                <img
                  src={qrPreview.dataUrl}
                  alt={`QR ${qrPreview.serial}`}
                  className="w-56 h-56"
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-1">
                  VOILÉE · Seri No
                </p>
                <p className="font-mono text-sm tracking-widest text-[#1C1C1E] font-medium">
                  {qrPreview.serial}
                </p>
                {qrPreview.productName && (
                  <p className="font-['Cormorant_Garamond'] italic text-base text-[#1C1C1E] mt-2">
                    {qrPreview.productName}
                  </p>
                )}
                {qrPreview.collection && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {qrPreview.collection}
                  </p>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground text-center font-['Cormorant_Garamond'] italic">
                {verificationUrl(qrPreview.serial)}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:flex-col sm:gap-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => qrPreview && copyLink(qrPreview.serial)}
            >
              <Copy className="h-4 w-4" />
              Bağlantıyı Kopyala
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => qrPreview && downloadBulkPdf([qrPreview.serial])}
            >
              <FileText className="h-4 w-4" />
              Etiket PDF
            </Button>
            <Button
              className="w-full gap-2"
              onClick={() => qrPreview && downloadQrPng(qrPreview.serial)}
            >
              <Download className="h-4 w-4" />
              PNG İndir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Doğrulama Kaydını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu doğrulama kaydını kalıcı olarak silmek istiyor musunuz? Kayıt silindikten sonra /dogrulama sayfasında artık görünmeyecek.
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
