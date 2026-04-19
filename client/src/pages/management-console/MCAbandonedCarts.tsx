import { ShoppingCart } from "lucide-react";

export default function MCAbandonedCarts() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-light">Satış</p>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-wide mt-1">Terk Sepetler</h1>
        </div>
        <ShoppingCart className="h-5 w-5 text-muted-foreground/40" />
      </div>

      <div className="bg-card border border-border/50 rounded">
        <div className="px-6 py-4 border-b border-border/40">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-light tracking-wide">Terk Edilen Sepetler</h2>
        </div>
        <div className="p-12 text-center space-y-3">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mx-auto" />
          <p className="text-sm text-muted-foreground">Terk sepet takibi henüz aktif değil.</p>
          <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
            Kullanıcı oturumu açıkken sepete ürün ekleyip ödeme yapmadan çıkan müşterileri
            burada görebilmek için oturum bazlı sepet takibi etkinleştirilmesi gerekiyor.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 border border-border/40 rounded p-5 space-y-3">
        <p className="text-xs tracking-wider uppercase text-muted-foreground font-light">Nasıl etkinleştirilir?</p>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Drizzle şemasına <code className="bg-muted px-1 rounded text-xs">abandonedCarts</code> tablosu ekleyin.</li>
          <li>Sepet değişikliklerini backend'e kaydedin (CartContext üzerinden tRPC mutation).</li>
          <li>Belirli süre (örn. 24 saat) sonra ödeme yapılmayan sepetleri bu listede gösterin.</li>
          <li>Terk sepet e-posta şablonunu "E-posta Şablonları" bölümünden yapılandırın.</li>
        </ol>
      </div>
    </div>
  );
}
