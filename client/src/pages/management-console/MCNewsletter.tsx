import { trpc } from "@/lib/trpc";
import { AlertCircle } from "lucide-react";

export default function MCNewsletter() {
  const { data: subs, isLoading, error } = trpc.admin.newsletter.list.useQuery(undefined, { retry: false });

  const activeSubs = subs?.filter(s => s.isActive) ?? [];
  const inactiveSubs = subs?.filter(s => !s.isActive) ?? [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">
          Bülten Yönetimi
        </p>
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">
          Bülten Aboneleri
        </h1>
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="bg-card border border-border/50 rounded p-4 space-y-1">
          <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
            Aktif
          </p>
          <p className="font-['Cormorant_Garamond'] text-3xl font-light">
            {isLoading ? "—" : activeSubs.length}
          </p>
        </div>
        <div className="bg-card border border-border/50 rounded p-4 space-y-1">
          <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">
            Pasif
          </p>
          <p className="font-['Cormorant_Garamond'] text-3xl font-light text-muted-foreground">
            {isLoading ? "—" : inactiveSubs.length}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : !subs?.length ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Henüz abone bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {["E-posta", "Dil", "Durum", "Abonelik Tarihi"].map(h => (
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
                {subs.map(sub => (
                  <tr
                    key={sub.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">{sub.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                        {sub.language || "TR"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          sub.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {sub.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString("tr-TR")}
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
