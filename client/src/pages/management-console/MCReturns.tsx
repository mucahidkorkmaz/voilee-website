import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, ShoppingBag, Banknote } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReturnStatus = "requested" | "accepted" | "rejected" | "processed";

const statuses: ReturnStatus[] = ["requested", "accepted", "rejected", "processed"];

const statusLabels: Record<ReturnStatus, string> = {
  requested: "Talep Edildi",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  processed: "Tamamlandı",
};

const statusColors: Record<ReturnStatus, string> = {
  requested: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  processed: "bg-emerald-100 text-emerald-700",
};

const reasonLabels: Record<string, string> = {
  defective: "Ürün hasarlı / kusurlu",
  wrong: "Yanlış ürün gönderildi",
  notAsDescribed: "Ürün açıklamaya uymuyor",
  noLongerNeeded: "İhtiyaç duyulmadı",
  other: "Diğer",
};

type ReturnItemRow = {
  id: number;
  returnId: number;
  productId: number | null;
  productName: string;
  quantity: number;
  price: string | null;
  imageUrl: string | null;
};

type ReturnRow = {
  id: number;
  returnNumber: string;
  orderNumber: string;
  userId: number | null;
  customerEmail: string | null;
  customerName: string | null;
  reason: string;
  notes: string | null;
  status: ReturnStatus;
  refundAmount: string | null;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: ReturnItemRow[];
};

function ReturnDetailDialog({
  item,
  open,
  onClose,
  onStatusChange,
  isPending,
}: {
  item: ReturnRow | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: ReturnStatus, adminNote?: string, refundAmount?: string) => void;
  isPending: boolean;
}) {
  const [adminNote, setAdminNote] = useState(item?.adminNote ?? "");
  const [refundAmount, setRefundAmount] = useState(item?.refundAmount ?? "");

  const computedTotal = item?.items.reduce((sum, ri) => {
    return sum + (ri.price ? Number(ri.price) * ri.quantity : 0);
  }, 0) ?? 0;

  useEffect(() => {
    if (item) {
      setAdminNote(item.adminNote ?? "");
      setRefundAmount(item.refundAmount ?? "");
    }
  }, [item]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Cormorant_Garamond'] text-2xl font-light">
            İade Talebi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">
                İade No
              </p>
              <p className="font-mono text-xs">{item.returnNumber}</p>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">
                Sipariş No
              </p>
              <p className="font-mono text-xs">#{item.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">
                Müşteri
              </p>
              <p className="text-sm">{item.customerName || "—"}</p>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">
                E-posta
              </p>
              <p className="text-xs text-muted-foreground break-all">{item.customerEmail || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">
                İade Nedeni
              </p>
              <p className="text-sm">{reasonLabels[item.reason] ?? item.reason}</p>
            </div>
            {item.notes && (
              <div className="col-span-2">
                <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">
                  Açıklama
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{item.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">
                Durum
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status]}`}>
                {statusLabels[item.status]}
              </span>
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-1">
                Tarih
              </p>
              <p className="text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          {/* Items */}
          {item.items.length > 0 && (
            <div className="border-t border-border/40 pt-4">
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-3">
                İade Edilecek Ürünler ({item.items.length})
              </p>
              <div className="space-y-2.5">
                {item.items.map((ri) => (
                  <div key={ri.id} className="flex items-center gap-3">
                    <div className="h-12 w-9 bg-muted flex-shrink-0 overflow-hidden rounded">
                      {ri.imageUrl ? (
                        <img
                          src={ri.imageUrl}
                          alt={ri.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                          <ShoppingBag className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ri.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {ri.quantity} adet
                        {ri.price && (
                          <> · ₺{(Number(ri.price) * ri.quantity).toFixed(2)}</>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refund amount */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
                İade Tutarı (₺)
              </p>
              {computedTotal > 0 && (
                <button
                  type="button"
                  onClick={() => setRefundAmount(computedTotal.toFixed(2))}
                  className="text-[10px] text-primary hover:underline"
                >
                  Ürün toplamını kullan: ₺{computedTotal.toFixed(2)}
                </button>
              )}
            </div>
            <div className="relative">
              <Banknote className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="pl-9 text-sm"
              />
            </div>
            {item.refundAmount && (
              <p className="text-xs text-muted-foreground">
                Kayıtlı iade tutarı: ₺{Number(item.refundAmount).toFixed(2)}
              </p>
            )}
          </div>

          {/* Admin note */}
          <div className="space-y-2">
            <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
              Yönetici Notu
            </p>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Müşteriye iletilecek not..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* Status actions */}
          <div className="space-y-2">
            <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
              Durumu Güncelle
            </p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(
                    item.id,
                    s,
                    adminNote || undefined,
                    refundAmount || undefined,
                  )}
                  disabled={item.status === s || isPending}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-opacity disabled:opacity-40 disabled:cursor-default ${statusColors[s]}`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MCReturns() {
  const utils = trpc.useUtils();
  const { data: returnsList, isLoading, error } = trpc.admin.returns.list.useQuery(undefined, {
    retry: false,
  });

  const [selectedItem, setSelectedItem] = useState<ReturnRow | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | "all">("all");

  const updateStatus = trpc.admin.returns.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.returns.list.invalidate();
      setSelectedItem(null);
      toast.success("İade durumu güncellendi.");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (returnsList as ReturnRow[] | undefined)?.filter(
    (r) => filterStatus === "all" || r.status === filterStatus,
  );

  const counts = (returnsList as ReturnRow[] | undefined)?.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ReturnStatus, number>,
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <ReturnDetailDialog
        item={selectedItem}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onStatusChange={(id, status, adminNote, refundAmount) =>
          updateStatus.mutate({ id, status, adminNote, refundAmount })
        }
        isPending={updateStatus.isPending}
      />

      <div>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
          Sipariş Yönetimi
        </p>
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
          İade Talepleri
        </h1>
      </div>

      {/* Summary cards */}
      {!isLoading && !error && returnsList && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
              className={`bg-card border rounded p-4 text-left transition-colors ${
                filterStatus === s ? "border-primary" : "border-border/50 hover:border-border"
              }`}
            >
              <p className="text-2xl font-light">{counts?.[s] ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{statusLabels[s]}</p>
            </button>
          ))}
        </div>
      )}

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

      {/* Filter */}
      {!isLoading && !error && (
        <div className="flex items-center gap-3">
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as ReturnStatus | "all")}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tüm Talepler</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {statusLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterStatus !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => setFilterStatus("all")}
            >
              Filtreyi Kaldır
            </Button>
          )}
        </div>
      )}

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !filtered?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {filterStatus === "all"
              ? "Henüz iade talebi bulunmuyor."
              : `"${statusLabels[filterStatus as ReturnStatus]}" durumunda talep yok.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["İade No", "Sipariş", "Müşteri", "Ürünler", "Neden", "Durum", "Tarih"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs tracking-wider uppercase text-muted-foreground font-normal whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                      {item.returnNumber}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">
                      #{item.orderNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm">{item.customerName || "—"}</p>
                      {item.customerEmail && (
                        <p className="text-xs text-muted-foreground">{item.customerEmail}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.items.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            {item.items.slice(0, 3).map((ri) =>
                              ri.imageUrl ? (
                                <img
                                  key={ri.id}
                                  src={ri.imageUrl}
                                  alt={ri.productName}
                                  className="h-7 w-6 object-cover border border-background rounded-sm"
                                />
                              ) : (
                                <div
                                  key={ri.id}
                                  className="h-7 w-6 bg-muted border border-background rounded-sm flex items-center justify-center"
                                >
                                  <ShoppingBag className="h-3 w-3 text-muted-foreground/40" />
                                </div>
                              ),
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.items.length} ürün
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs max-w-[140px] truncate">
                      {reasonLabels[item.reason] ?? item.reason}
                    </td>
                    <td className="px-4 py-3.5">
                      <Select
                        value={item.status}
                        onValueChange={(value) => {
                          updateStatus.mutate({ id: item.id, status: value as ReturnStatus });
                        }}
                      >
                        <SelectTrigger
                          className="h-7 w-36 text-xs border-0 p-0 shadow-none focus:ring-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status]}`}
                            >
                              {statusLabels[item.status]}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent onClick={(e) => e.stopPropagation()}>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[s]}`}
                              >
                                {statusLabels[s]}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
