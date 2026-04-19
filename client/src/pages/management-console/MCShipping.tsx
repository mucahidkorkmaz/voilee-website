import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ShippingForm = {
  freeShippingThreshold: string;
  shippingCostDomestic: string;
  shippingCostInternational: string;
};

export default function MCShipping() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.admin.settings.get.useQuery(undefined, { retry: false });
  const updateMutation = trpc.admin.settings.update.useMutation({
    onSuccess: () => { utils.admin.settings.get.invalidate(); toast.success("Kargo ayarları kaydedildi."); setDirty(false); },
    onError: e => toast.error(e.message),
  });

  const [form, setForm] = useState<ShippingForm>({ freeShippingThreshold: "500", shippingCostDomestic: "49.99", shippingCostInternational: "199.99" });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        freeShippingThreshold: data.freeShippingThreshold ?? "500",
        shippingCostDomestic: data.shippingCostDomestic ?? "49.99",
        shippingCostInternational: data.shippingCostInternational ?? "199.99",
      });
    }
  }, [data]);

  const set = (k: keyof ShippingForm, v: string) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-2xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Pazarlama</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Kargo</h1>
        </div>
        <Truck className="h-5 w-5 text-muted-foreground/40" />
      </div>

      {error && <div className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><p>Veri yüklenemedi.</p></div>}

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}</div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-5">
            <div className="pb-3 border-b border-border/40">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">Ücretsiz Kargo</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Ücretsiz Kargo Eşiği (₺)</Label>
              <Input type="number" min="0" step="0.01" value={form.freeShippingThreshold} onChange={e => set("freeShippingThreshold", e.target.value)} placeholder="500.00" className="max-w-xs" />
              <p className="text-xs text-muted-foreground">Bu tutarın üzerindeki siparişlerde kargo ücretsiz olacak.</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="pb-3 border-b border-border/40">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">Kargo Ücretleri</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Yurt İçi Kargo (₺)</Label>
                <Input type="number" min="0" step="0.01" value={form.shippingCostDomestic} onChange={e => set("shippingCostDomestic", e.target.value)} placeholder="49.99" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground font-normal">Yurt Dışı Kargo (₺)</Label>
                <Input type="number" min="0" step="0.01" value={form.shippingCostInternational} onChange={e => set("shippingCostInternational", e.target.value)} placeholder="199.99" />
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-2 border-t border-border/40">
            <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending || !dirty} className="gap-2">
              <Save className="h-4 w-4" />{updateMutation.isPending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
