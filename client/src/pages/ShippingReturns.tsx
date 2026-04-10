import { useState } from "react";
import { Package, RefreshCw, Globe, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShippingReturns() {
  const { lang } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<"shipping" | "returns">("shipping");

  
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
              {getText("Bilgi", "Information", "Information")}
            </p>
            <h1 className="font-display text-5xl text-[#1C1C1E]">
              {getText("Kargo & İade", "Shipping & Returns", "الشحن والعودة")}
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-12 border-b border-[#1C1C1E]/10">
            {(["shipping", "returns"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body text-xs tracking-[0.15em] uppercase px-6 py-3 border-b-2 transition-all duration-300 ${
                  activeTab === tab
                    ? "border-[#C9A96E] text-[#1C1C1E]"
                    : "border-transparent text-[#1C1C1E]/40 hover:text-[#1C1C1E]/70"
                }`}
              >
                {tab === "shipping" ? (getText("Kargo", "Shipping", "Shipping")) : (getText("İade", "Returns", "Returns"))}
              </button>
            ))}
          </div>

          {activeTab === "shipping" && (
            <div className="space-y-10">
              {/* Domestic */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Package size={20} className="text-[#C9A96E]" />
                  <h2 className="font-display text-2xl text-[#1C1C1E]">
                    {getText("Türkiye İçi Kargo", "Domestic Shipping", "Domestic Shipping")}
                  </h2>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {[
                    { labelTR: "Standart Teslimat", labelEN: "Standard Delivery", detailTR: "1-3 iş günü", detailEN: "1-3 business days", priceTR: "Ücretsiz (500₺ üzeri)", priceEN: "Free (over ₺500)" },
                    { labelTR: "Ekspres Teslimat", labelEN: "Express Delivery", detailTR: "Ertesi gün", detailEN: "Next day", priceTR: "₺49", priceEN: "₺49" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-6 border border-[#C9A96E]/10">
                      <h3 className="font-body text-sm font-medium text-[#1C1C1E] mb-2">
                        {lang === "TR" ? item.labelTR : item.labelEN}
                      </h3>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={12} className="text-[#C9A96E]" />
                        <span className="font-body text-xs text-[#1C1C1E]/60">{lang === "TR" ? item.detailTR : item.detailEN}</span>
                      </div>
                      <p className="font-display text-lg text-[#C9A96E]">{lang === "TR" ? item.priceTR : item.priceEN}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* International */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Globe size={20} className="text-[#C9A96E]" />
                  <h2 className="font-display text-2xl text-[#1C1C1E]">
                    {getText("Uluslararası Kargo", "International Shipping", "الشحن الدولي")}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1C1C1E]/10">
                        <th className="font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/40 text-left py-3 pr-4">{getText("Bölge", "Region", "Region")}</th>
                        <th className="font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/40 text-left py-3 pr-4">{getText("Süre", "Duration", "Duration")}</th>
                        <th className="font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/40 text-left py-3">{getText("Ücret", "Cost", "Cost")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { regionTR: "Avrupa", regionEN: "Europe", timeTR: "3-7 iş günü", timeEN: "3-7 business days", priceTR: "₺199", priceEN: "₺199" },
                        { regionTR: "Orta Doğu & Körfez", regionEN: "Middle East & Gulf", timeTR: "4-8 iş günü", timeEN: "4-8 business days", priceTR: "₺249", priceEN: "₺249" },
                        { regionTR: "Kuzey Amerika", regionEN: "North America", timeTR: "7-12 iş günü", timeEN: "7-12 business days", priceTR: "₺299", priceEN: "₺299" },
                        { regionTR: "Asya & Diğer", regionEN: "Asia & Others", timeTR: "8-14 iş günü", timeEN: "8-14 business days", priceTR: "₺349", priceEN: "₺349" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-[#1C1C1E]/5">
                          <td className="font-body text-sm text-[#1C1C1E] py-4 pr-4">{lang === "TR" ? row.regionTR : row.regionEN}</td>
                          <td className="font-body text-sm text-[#1C1C1E]/60 py-4 pr-4">{lang === "TR" ? row.timeTR : row.timeEN}</td>
                          <td className="font-display text-base text-[#C9A96E] py-4">{lang === "TR" ? row.priceTR : row.priceEN}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "returns" && (
            <div className="space-y-10">
              <div className="flex items-center gap-3 mb-6">
                <RefreshCw size={20} className="text-[#C9A96E]" />
                <h2 className="font-display text-2xl text-[#1C1C1E]">
                  {getText("İade Politikamız", "Our Return Policy", "Our Return Policy")}
                </h2>
              </div>
              <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/20 p-6 mb-8">
                <p className="font-display text-xl text-[#1C1C1E] mb-2">
                  {getText("30 Gün İade Garantisi", "30-Day Return Guarantee", "30-Day Return Guarantee")}
                </p>
                <p className="font-body text-sm text-[#1C1C1E]/70">
                  {lang === "TR"
                    ? "Satın alma tarihinden itibaren 30 gün içinde, kullanılmamış ve orijinal etiketleri yerinde olan ürünleri iade edebilirsiniz."
                    : "You can return unused products with original tags intact within 30 days of purchase."}
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { titleTR: "İade Koşulları", titleEN: "Return Conditions", itemsTR: ["Ürün kullanılmamış olmalı", "Orijinal etiketler yerinde olmalı", "Orijinal ambalajında gönderilmeli", "Satın alma belgesi ile birlikte"], itemsEN: ["Product must be unused", "Original tags must be intact", "Must be sent in original packaging", "With proof of purchase"] },
                  { titleTR: "İade Süreci", titleEN: "Return Process", itemsTR: ["info@voilee.com.tr adresine iade talebinizi bildirin", "Size iade kodu ve talimatlar gönderilir", "Ürünü kargoya verin", "Onaydan sonra 5-7 iş günü içinde iade yapılır"], itemsEN: ["Notify your return request to info@voilee.com.tr", "Return code and instructions will be sent to you", "Ship the product", "Refund processed within 5-7 business days after approval"] },
                ].map((section, i) => (
                  <div key={i} className="bg-white p-6 border border-[#C9A96E]/10">
                    <h3 className="font-body text-sm font-medium text-[#1C1C1E] mb-4">
                      {lang === "TR" ? section.titleTR : section.titleEN}
                    </h3>
                    <ul className="space-y-2">
                      {(lang === "TR" ? section.itemsTR : section.itemsEN).map((item, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-[#C9A96E] shrink-0" />
                          <span className="font-body text-sm text-[#1C1C1E]/70">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
