import { ExternalLink, ShoppingCart, Store } from "lucide-react";

const CHANNELS = [
  { name: "Trendyol", description: "Türkiye'nin en büyük e-ticaret platformu", icon: "🛍️", color: "bg-orange-50 border-orange-200", coming: true },
  { name: "Hepsiburada", description: "Hepsiburada mağaza entegrasyonu", icon: "🏪", color: "bg-red-50 border-red-200", coming: true },
  { name: "Amazon TR", description: "Amazon Türkiye satıcı entegrasyonu", icon: "📦", color: "bg-yellow-50 border-yellow-200", coming: true },
  { name: "N11", description: "N11 pazar yeri entegrasyonu", icon: "🏬", color: "bg-purple-50 border-purple-200", coming: true },
  { name: "Çiçeksepeti", description: "Çiçeksepeti mağaza bağlantısı", icon: "🌸", color: "bg-pink-50 border-pink-200", coming: true },
  { name: "Google Shopping", description: "Google Alışveriş ürün feed'i", icon: "🔍", color: "bg-blue-50 border-blue-200", coming: true },
];

export default function MCMarketplace() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Pazarlama</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Marketplace</h1>
        </div>
        <Store className="h-5 w-5 text-muted-foreground/40" />
      </div>

      <div className="bg-card border border-border/50 rounded p-5 flex items-start gap-3">
        <ShoppingCart className="h-5 w-5 text-muted-foreground/60 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Çok Kanallı Satış</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ürünlerinizi birden fazla pazar yerinde listeleyin. Entegrasyonlar yakında eklenecek.
            Webhook'lar üzerinden kendi entegrasyonunuzu kurabilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {CHANNELS.map(channel => (
          <div key={channel.name} className={`relative border rounded p-5 space-y-3 ${channel.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl">{channel.icon}</span>
              {channel.coming && (
                <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded font-medium">Yakında</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{channel.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{channel.description}</p>
            </div>
            <button disabled className="text-xs text-muted-foreground/50 flex items-center gap-1 cursor-not-allowed">
              <ExternalLink className="h-3 w-3" /> Entegre Et
            </button>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 border border-border/40 rounded p-5">
        <p className="text-xs tracking-wider uppercase text-muted-foreground font-light mb-2">Özel Entegrasyon</p>
        <p className="text-sm text-muted-foreground">
          Kendi entegrasyonunuzu kurmak için <strong>Webhooks</strong> bölümünü kullanın.
          Sipariş, ürün ve kullanıcı olaylarını istediğiniz endpoint'e iletebilirsiniz.
        </p>
      </div>
    </div>
  );
}
