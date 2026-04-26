import { ShoppingCart, Mail, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const HOUR_OPTIONS = [6, 12, 24, 48, 72] as const;

function parseItemCount(itemsJson: string): number {
  try {
    const arr = JSON.parse(itemsJson) as unknown;
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export default function MCAbandonedCarts() {
  const [minHours, setMinHours] = useState<number>(24);
  const { data: rows, isLoading, refetch } = trpc.admin.abandonedCarts.list.useQuery({
    minInactiveHours: minHours,
  });

  const sendMutation = trpc.admin.abandonedCarts.sendReminder.useMutation({
    onSuccess: () => {
      toast.success("Hatırlatma e-postası gönderildi.");
      void refetch();
    },
    onError: err => {
      toast.error(err.message || "Gönderilemedi.");
    },
  });

  const sorted = useMemo(() => (rows ? [...rows] : []), [rows]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Satış</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Terk Sepetler</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Sepetinde ürün bırakıp son güncellemesinden en az seçtiğiniz süre geçmiş kayıtlar listelenir. E-posta metni{" "}
            <span className="text-foreground/80">E-posta Şablonları</span> bölümündeki{" "}
            <span className="font-mono text-xs">automationAbandonedCart</span> şablonundan gelir.
          </p>
        </div>
        <ShoppingCart className="h-5 w-5 text-muted-foreground/40 hidden sm:block shrink-0" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Minimum bekletme</span>
        <Select
          value={String(minHours)}
          onValueChange={v => setMinHours(Number(v))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOUR_OPTIONS.map(h => (
              <SelectItem key={h} value={String(h)}>
                Son {h} saat güncellenmemiş
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between gap-2">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">Kayıtlar</h2>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {!isLoading && sorted.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mx-auto" />
            <p className="text-sm text-muted-foreground">Bu kriterlere uyan terk sepet yok.</p>
            <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
              Müşteri tarayıcısında sepet değiştikçe kayıtlar oluşur. Henüz veri yoksa veya süre eşiğini düşürmeyi
              deneyin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Son aktivite</th>
                  <th className="px-4 py-3 font-medium">E-posta</th>
                  <th className="px-4 py-3 font-medium">Ad</th>
                  <th className="px-4 py-3 font-medium text-right">Kalem</th>
                  <th className="px-4 py-3 font-medium text-right">Tutar</th>
                  <th className="px-4 py-3 font-medium">Hatırlatma</th>
                  <th className="px-4 py-3 font-medium w-[120px]" />
                </tr>
              </thead>
              <tbody>
                {sorted.map(row => {
                  const email = row.customerEmail?.trim();
                  const canMail = !!email;
                  const total = Number(row.cartTotal);
                  const totalLabel = `₺${total.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  return (
                    <tr key={row.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(row.lastActivityAt).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{email || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.customerName?.trim() || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{parseItemCount(row.itemsJson)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{totalLabel}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {row.reminderEmailSentAt
                          ? new Date(row.reminderEmailSentAt).toLocaleString("tr-TR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={!canMail || sendMutation.isPending}
                          onClick={() => sendMutation.mutate({ id: row.id })}
                          title={!canMail ? "Giriş yapmamış veya e-postası olmayan oturum" : undefined}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          E-posta
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
