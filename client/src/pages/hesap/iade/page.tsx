import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  RotateCcw,
  Package,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
} from "lucide-react";
import AccountLayout, { hesapUrls } from "../layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrders, OrderHistoryItem } from "@/contexts/OrdersContext";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ─── Translations ───────────────────────────────────────────────────────────────

const t = {
  TR: {
    overline: "İadelerim",
    title: "İade Talepleri",
    newReturn: "Yeni İade Talebi",
    myReturns: "Mevcut İade Taleplerim",
    noActiveReturns: "Henüz bir iade talebiniz yok.",
    noOrders: "İade edilebilecek sipariş bulunmuyor.",
    noOrdersDesc: "Yalnızca teslim edilmiş siparişler için iade talebi oluşturabilirsiniz.",
    step1: "1. Sipariş Seçin",
    step2: "2. Ürün ve Neden Seçin",
    selectItems: "İade etmek istediğiniz ürünleri seçin",
    qty: "Adet",
    returnQty: "İade adedi",
    reason: "İade Nedeni",
    reasons: {
      defective: "Ürün hasarlı / kusurlu",
      wrong: "Yanlış ürün gönderildi",
      notAsDescribed: "Ürün açıklamaya uymuyor",
      noLongerNeeded: "İhtiyaç duyulmadı",
      other: "Diğer",
    },
    notes: "Açıklama (isteğe bağlı)",
    notesPlaceholder: "İade nedeninizi kısaca açıklayın...",
    submit: "İade Talebi Gönder",
    submitting: "Gönderiliyor...",
    success: "İade talebiniz alındı.",
    required: "Lütfen en az bir ürün ve iade nedeni seçin.",
    noItemsSelected: "En az bir ürün seçmelisiniz.",
    activeReturnExists: "Bu sipariş için zaten aktif bir iade talebi var.",
    viewDetail: "Detayı Görüntüle →",
    orderNo: "Sipariş No",
    returnNo: "İade No",
    date: "Tarih",
    statuses: {
      requested: "Talep Alındı",
      accepted: "Kabul Edildi",
      rejected: "Reddedildi",
      processed: "Tamamlandı",
    },
  },
  EN: {
    overline: "My Returns",
    title: "Return Requests",
    newReturn: "New Return Request",
    myReturns: "My Current Return Requests",
    noActiveReturns: "You have no return requests yet.",
    noOrders: "No returnable orders found.",
    noOrdersDesc: "Only delivered orders are eligible for a return request.",
    step1: "1. Select Order",
    step2: "2. Select Items & Reason",
    selectItems: "Select the items you want to return",
    qty: "Qty",
    returnQty: "Return qty",
    reason: "Return Reason",
    reasons: {
      defective: "Product is damaged / defective",
      wrong: "Wrong item was sent",
      notAsDescribed: "Item doesn't match description",
      noLongerNeeded: "No longer needed",
      other: "Other",
    },
    notes: "Notes (optional)",
    notesPlaceholder: "Briefly describe your reason for return...",
    submit: "Submit Return Request",
    submitting: "Submitting...",
    success: "Your return request has been received.",
    required: "Please select at least one item and a return reason.",
    noItemsSelected: "You must select at least one item.",
    activeReturnExists: "There is already an active return request for this order.",
    viewDetail: "View Detail →",
    orderNo: "Order No",
    returnNo: "Return No",
    date: "Date",
    statuses: {
      requested: "Request Received",
      accepted: "Accepted",
      rejected: "Rejected",
      processed: "Completed",
    },
  },
  AR: {
    overline: "مرتجعاتي",
    title: "طلبات الإرجاع",
    newReturn: "طلب إرجاع جديد",
    myReturns: "طلبات الإرجاع الحالية",
    noActiveReturns: "ليس لديك أي طلبات إرجاع بعد.",
    noOrders: "لا توجد طلبات قابلة للإرجاع.",
    noOrdersDesc: "يمكن تقديم طلب الإرجاع للطلبات المُسلَّمة فقط.",
    step1: "١. اختر الطلب",
    step2: "٢. اختر المنتجات والسبب",
    selectItems: "اختر المنتجات التي تريد إرجاعها",
    qty: "الكمية",
    returnQty: "كمية الإرجاع",
    reason: "سبب الإرجاع",
    reasons: {
      defective: "المنتج تالف / معيب",
      wrong: "تم إرسال منتج خاطئ",
      notAsDescribed: "المنتج لا يطابق الوصف",
      noLongerNeeded: "لم أعد بحاجة إليه",
      other: "أخرى",
    },
    notes: "ملاحظات (اختياري)",
    notesPlaceholder: "صف سبب إرجاعك باختصار...",
    submit: "إرسال طلب الإرجاع",
    submitting: "جارٍ الإرسال...",
    success: "تم استلام طلب الإرجاع.",
    required: "يرجى تحديد منتج واحد على الأقل وسبب الإرجاع.",
    noItemsSelected: "يجب اختيار منتج واحد على الأقل.",
    activeReturnExists: "يوجد بالفعل طلب إرجاع نشط لهذا الطلب.",
    viewDetail: "عرض التفاصيل →",
    orderNo: "رقم الطلب",
    returnNo: "رقم الإرجاع",
    date: "التاريخ",
    statuses: {
      requested: "تم استلام الطلب",
      accepted: "مقبول",
      rejected: "مرفوض",
      processed: "مكتمل",
    },
  },
};

const statusColors: Record<string, string> = {
  requested: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  processed: "bg-emerald-100 text-emerald-700",
};

const statusIcons: Record<string, React.ElementType> = {
  requested: Clock,
  accepted: CheckCircle2,
  rejected: XCircle,
  processed: PackageCheck,
};

const localeMap = { TR: "tr-TR", EN: "en-US", AR: "ar-EG" } as const;

function formatDate(ts: number | Date, lang: keyof typeof localeMap) {
  try {
    return new Date(ts).toLocaleDateString(localeMap[lang], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

type SelectedItem = { item: OrderHistoryItem; returnQty: number };

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function IadePage() {
  const { lang, isRTL } = useLanguage();
  const { orders } = useOrders();
  const [, setLocation] = useLocation();
  const tx = t[lang];
  const u = hesapUrls[lang];

  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const [selectedOrderNo, setSelectedOrderNo] = useState("");
  const selectedOrder = orders.find((o) => o.orderNumber === selectedOrderNo);

  const [selectedItems, setSelectedItems] = useState<Record<number, SelectedItem>>({});
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch user's existing returns
  const { data: myReturns, isLoading: returnsLoading } = trpc.returns.myReturns.useQuery(
    undefined,
    { retry: false },
  );

  // ── Item-level return tracking ──────────────────────────────────────────────
  // Build a map: { orderNumber → { itemKey → returnedQty } }
  // itemKey = "id:{productId}" or "name:{productName}" for items without productId
  const returnedQtyMap = (myReturns ?? []).reduce<Record<string, Record<string, number>>>(
    (acc, ret) => {
      if (ret.status === "rejected") return acc; // rejected doesn't count
      for (const item of ret.items) {
        const key = item.productId ? `id:${item.productId}` : `name:${item.productName}`;
        if (!acc[ret.orderNumber]) acc[ret.orderNumber] = {};
        acc[ret.orderNumber][key] = (acc[ret.orderNumber][key] ?? 0) + item.quantity;
      }
      return acc;
    },
    {},
  );

  function getItemKey(item: OrderHistoryItem) {
    return item.productId ? `id:${item.productId}` : `name:${item.productName}`;
  }

  function getRemainingQty(orderNumber: string, item: OrderHistoryItem): number {
    const returned = returnedQtyMap[orderNumber]?.[getItemKey(item)] ?? 0;
    return Math.max(0, item.quantity - returned);
  }

  // Orders that still have at least one returnable item
  const returnableOrders = deliveredOrders.filter((order) =>
    order.items.some((item) => getRemainingQty(order.orderNumber, item) > 0),
  );

  const submitReturn = trpc.returns.submit.useMutation({
    onSuccess: (data) => {
      toast.success(tx.success);
      setLocation(u.iadeDetay(String(data.id)));
    },
    onError: (err) => {
      toast.error(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  const toggleItem = (idx: number, item: OrderHistoryItem) => {
    setSelectedItems((prev) => {
      if (prev[idx]) {
        const next = { ...prev };
        delete next[idx];
        return next;
      }
      const remaining = getRemainingQty(selectedOrderNo, item);
      return { ...prev, [idx]: { item, returnQty: Math.min(1, remaining) } };
    });
  };

  const setQty = (idx: number, qty: number, max: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], returnQty: Math.max(1, Math.min(qty, max)) },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedItems).length === 0) {
      toast.error(tx.noItemsSelected);
      return;
    }
    if (!reason) {
      toast.error(tx.required);
      return;
    }
    submitReturn.mutate({
      orderNumber: selectedOrderNo,
      reason,
      notes: notes || undefined,
      items: Object.values(selectedItems).map(({ item, returnQty }) => ({
        productId: item.productId ?? null,
        productName: item.productName,
        quantity: returnQty,
        price: item.price ?? null,
        imageUrl: item.imageUrl ?? null,
      })),
    });
  };

  return (
    <AccountLayout>
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <p className="font-body text-[11px] tracking-[0.3em] uppercase text-[#C9A96E] mb-3">
          {tx.overline}
        </p>
        <h1 className="font-display text-3xl lg:text-4xl text-[#1C1C1E] leading-tight">
          {tx.title}
        </h1>
      </div>

      {/* ── Existing returns ── */}
      <div className="mb-8">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-3">
          {tx.myReturns}
        </p>

        {returnsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-white border border-[#C9A96E]/10 animate-pulse" />
            ))}
          </div>
        ) : !myReturns?.length ? (
          <p className="font-body text-sm text-[#1C1C1E]/40 py-4">{tx.noActiveReturns}</p>
        ) : (
          <div className="space-y-2">
            {myReturns.map((ret) => {
              const StatusIcon = statusIcons[ret.status] ?? Clock;
              return (
                <Link
                  key={ret.id}
                  href={u.iadeDetay(String(ret.id))}
                  className={`flex items-center gap-4 bg-white border border-[#C9A96E]/15 px-5 py-4 hover:border-[#C9A96E]/40 transition-colors group ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${statusColors[ret.status]}`}
                  >
                    <StatusIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-[#1C1C1E] font-medium">
                      {ret.returnNumber}
                    </p>
                    <p className="font-body text-xs text-[#1C1C1E]/45 mt-0.5">
                      {tx.orderNo} #{ret.orderNumber}
                      {ret.items.length > 0 && (
                        <> · {ret.items.length} {lang === "TR" ? "ürün" : lang === "EN" ? "items" : "منتجات"}</>
                      )}
                      {" · "}{formatDate(ret.createdAt, lang)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[ret.status]}`}
                    >
                      {tx.statuses[ret.status as keyof typeof tx.statuses]}
                    </span>
                    <ChevronRight
                      size={14}
                      className={`text-[#1C1C1E]/30 group-hover:text-[#C9A96E] transition-colors ${
                        isRTL ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── New return form ── */}
      <div className="border-t border-[#C9A96E]/15 pt-8">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-5">
          {tx.newReturn}
        </p>

        {returnableOrders.length === 0 && !returnsLoading ? (
          <div className="bg-white border border-[#C9A96E]/15 py-16 px-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#F7F3EC] border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-5">
              <RotateCcw size={20} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-xl text-[#1C1C1E] mb-2">{tx.noOrders}</h2>
            <p className="font-body text-sm text-[#1C1C1E]/55 max-w-sm mb-6">
              {tx.noOrdersDesc}
            </p>
            <Link
              href={u.siparisler}
              className={`inline-flex items-center gap-1.5 font-body text-[11px] tracking-[0.2em] uppercase text-[#1C1C1E]/60 hover:text-[#C9A96E] transition-colors ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Package size={14} />
              {lang === "TR" ? "Siparişlerime Git" : lang === "EN" ? "View My Orders" : "عرض طلباتي"}
              <ChevronRight size={12} className={isRTL ? "rotate-180" : ""} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
            {/* Step 1: Order selection — only orders with remaining returnable items */}
            <div className="bg-white border border-[#C9A96E]/15 p-6 lg:p-7">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40 mb-4">
                {tx.step1}
              </p>
              {returnsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-[#F7F3EC] border border-[#C9A96E]/10 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {returnableOrders.map((order) => {
                    const isSelected = selectedOrderNo === order.orderNumber;
                    const returnableCount = order.items.filter(
                      (item) => getRemainingQty(order.orderNumber, item) > 0,
                    ).length;
                    const hasPartialReturn = order.items.some(
                      (item) => (returnedQtyMap[order.orderNumber]?.[getItemKey(item)] ?? 0) > 0,
                    );
                    return (
                      <button
                        key={order.orderNumber}
                        type="button"
                        onClick={() => { setSelectedOrderNo(order.orderNumber); setSelectedItems({}); }}
                        className={`w-full text-left flex items-center gap-4 border p-4 transition-colors ${isRTL ? "flex-row-reverse text-right" : ""} ${
                          isSelected ? "border-[#C9A96E]/60 bg-[#C9A96E]/5" : "border-[#1C1C1E]/10 hover:border-[#C9A96E]/30"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "border-[#C9A96E] bg-[#C9A96E]" : "border-[#1C1C1E]/20"}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-[#1C1C1E] font-medium">#{order.orderNumber}</p>
                          <p className="font-body text-xs text-[#1C1C1E]/50 mt-0.5">
                            {formatDate(order.createdAt, lang)} · {returnableCount}{" "}
                            {lang === "TR" ? "iade edilebilir ürün" : lang === "EN" ? "returnable items" : "منتجات قابلة للإرجاع"}{" "}
                            · ₺{order.total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        {hasPartialReturn && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded flex-shrink-0 bg-amber-100 text-amber-700">
                            <RotateCcw size={9} />
                            {lang === "TR" ? "Kısmi iade" : lang === "EN" ? "Partial return" : "إرجاع جزئي"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Items + reason — only items with remaining returnable qty */}
            {selectedOrder && (
              <form onSubmit={handleSubmit} className="bg-white border border-[#C9A96E]/15 p-6 lg:p-7 space-y-7">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/40">{tx.step2}</p>

                {/* Item list */}
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 mb-3">{tx.selectItems}</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => {
                      const remaining = getRemainingQty(selectedOrder.orderNumber, item);
                      if (remaining === 0) return null;
                      const sel = selectedItems[idx];
                      const isChecked = !!sel;
                      const alreadyReturned = returnedQtyMap[selectedOrder.orderNumber]?.[getItemKey(item)] ?? 0;
                      return (
                        <div key={`${item.productId ?? "x"}-${idx}`} className={`border transition-colors ${isChecked ? "border-[#C9A96E]/50 bg-[#C9A96E]/4" : "border-[#1C1C1E]/10"}`}>
                          <div className={`flex items-center gap-4 p-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <button type="button" onClick={() => toggleItem(idx, item)}
                              className={`w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isChecked ? "border-[#C9A96E] bg-[#C9A96E]" : "border-[#1C1C1E]/20 bg-white"}`}>
                              {isChecked && (
                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                            <div className="w-12 h-14 bg-[#E8E0D5] flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => toggleItem(idx, item)}>
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#C9A96E]/30"><ShoppingBag size={14} /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleItem(idx, item)}>
                              <p className="font-body text-sm text-[#1C1C1E] font-medium leading-tight">{item.productName}</p>
                              <p className="font-body text-xs text-[#1C1C1E]/45 mt-0.5">
                                {lang === "TR" ? "İade edilebilir" : lang === "EN" ? "Returnable" : "قابل للإرجاع"}: {remaining}
                                {alreadyReturned > 0 && (
                                  <span className="text-amber-600"> ({lang === "TR" ? "önceki" : lang === "EN" ? "prev." : "سابق"}: {alreadyReturned})</span>
                                )}
                              </p>
                            </div>
                            {isChecked && (
                              <div className={`flex items-center gap-2 flex-shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                                <button type="button" onClick={() => setQty(idx, sel.returnQty - 1, remaining)} disabled={sel.returnQty <= 1}
                                  className="w-6 h-6 border border-[#1C1C1E]/15 flex items-center justify-center text-[#1C1C1E]/60 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                  <Minus size={10} />
                                </button>
                                <span className="font-body text-sm text-[#1C1C1E] w-5 text-center">{sel.returnQty}</span>
                                <button type="button" onClick={() => setQty(idx, sel.returnQty + 1, remaining)} disabled={sel.returnQty >= remaining}
                                  className="w-6 h-6 border border-[#1C1C1E]/15 flex items-center justify-center text-[#1C1C1E]/60 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                  <Plus size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 mb-3">
                    {tx.reason}
                  </p>
                  <div className="space-y-2">
                    {(Object.entries(tx.reasons) as [string, string][]).map(([key, label]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-3 cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={key}
                          checked={reason === key}
                          onChange={(e) => setReason(e.target.value)}
                          className="accent-[#C9A96E] flex-shrink-0"
                        />
                        <span className="font-body text-sm text-[#1C1C1E]/80">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-[#1C1C1E]/50 mb-2">
                    {tx.notes}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={tx.notesPlaceholder}
                    rows={3}
                    className="w-full bg-transparent border-b border-[#1C1C1E]/20 px-0 py-2 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none focus:border-[#C9A96E] resize-none transition-colors"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    submitReturn.isPending ||
                    Object.keys(selectedItems).length === 0 ||
                    !reason
                  }
                  className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase bg-[#1C1C1E] text-[#F7F3EC] px-8 py-3.5 hover:bg-[#C9A96E] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitReturn.isPending ? tx.submitting : tx.submit}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
