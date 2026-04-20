import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOrders } from "@/contexts/OrdersContext";
import { ChevronLeft, ShoppingBag, CreditCard, Building2, CheckCircle2, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { sitePaths } from "@/lib/sitePaths";

const t = {
  TR: {
    back: "Alışverişe Dön",
    title: "Ödeme",
    contact: "İletişim Bilgileri",
    firstName: "Ad",
    lastName: "Soyad",
    email: "E-posta",
    phone: "Telefon",
    shipping: "Teslimat Adresi",
    address: "Adres",
    addressPlaceholder: "Sokak, Bina No, Daire No",
    city: "Şehir",
    district: "İlçe",
    postalCode: "Posta Kodu",
    country: "Ülke",
    turkiye: "Türkiye",
    payment: "Ödeme Yöntemi",
    creditCard: "Kredi / Banka Kartı",
    bankTransfer: "Havale / EFT",
    cardNumber: "Kart Numarası",
    cardName: "Kart Üzerindeki İsim",
    expiry: "Son Kullanma",
    cvv: "CVV",
    bankInfo: "Aşağıdaki hesaba havale yapabilirsiniz:",
    bankName: "Banka: —",
    iban: "IBAN: —",
    bankDesc: "Havale açıklamasına adınızı ve soyadınızı yazınız. Ödeme onaylandıktan sonra siparişiniz hazırlanacaktır.",
    orderSummary: "Sipariş Özeti",
    subtotal: "Ara Toplam",
    shippingCost: "Kargo",
    free: "Ücretsiz",
    total: "Toplam",
    placeOrder: "Siparişi Tamamla",
    secure: "256-bit SSL ile güvenli ödeme",
    required: "Bu alan zorunludur",
    successTitle: "Siparişiniz Alındı!",
    successDesc: "Siparişiniz başarıyla oluşturuldu. Onay e-postası kısa süre içinde gönderilecektir.",
    backHome: "Ana Sayfaya Dön",
    emptyCart: "Sepetiniz Boş",
    emptyCartDesc: "Ödeme yapabilmek için sepetinize ürün eklemeniz gerekiyor.",
    goShopping: "Alışverişe Başla",
    expiryPlaceholder: "AA / YY",
  },
  EN: {
    back: "Back to Shopping",
    title: "Checkout",
    contact: "Contact Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    shipping: "Shipping Address",
    address: "Address",
    addressPlaceholder: "Street, Building No, Apt No",
    city: "City",
    district: "District",
    postalCode: "Postal Code",
    country: "Country",
    turkiye: "Türkiye",
    payment: "Payment Method",
    creditCard: "Credit / Debit Card",
    bankTransfer: "Bank Transfer",
    cardNumber: "Card Number",
    cardName: "Name on Card",
    expiry: "Expiry Date",
    cvv: "CVV",
    bankInfo: "You can transfer to the account below:",
    bankName: "Bank: —",
    iban: "IBAN: —",
    bankDesc: "Please include your full name in the transfer description. Your order will be prepared after payment is confirmed.",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shippingCost: "Shipping",
    free: "Free",
    total: "Total",
    placeOrder: "Place Order",
    secure: "Secure payment with 256-bit SSL",
    required: "This field is required",
    successTitle: "Order Received!",
    successDesc: "Your order has been successfully created. A confirmation email will be sent shortly.",
    backHome: "Back to Home",
    emptyCart: "Your Cart is Empty",
    emptyCartDesc: "Please add items to your cart before proceeding to checkout.",
    goShopping: "Start Shopping",
    expiryPlaceholder: "MM / YY",
  },
  AR: {
    back: "العودة للتسوق",
    title: "الدفع",
    contact: "معلومات التواصل",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    shipping: "عنوان الشحن",
    address: "العنوان",
    addressPlaceholder: "الشارع، رقم المبنى، رقم الشقة",
    city: "المدينة",
    district: "المنطقة",
    postalCode: "الرمز البريدي",
    country: "البلد",
    turkiye: "تركيا",
    payment: "طريقة الدفع",
    creditCard: "بطاقة ائتمان / خصم",
    bankTransfer: "تحويل بنكي",
    cardNumber: "رقم البطاقة",
    cardName: "الاسم على البطاقة",
    expiry: "تاريخ الانتهاء",
    cvv: "CVV",
    bankInfo: "يمكنك التحويل إلى الحساب أدناه:",
    bankName: "البنك: —",
    iban: "IBAN: —",
    bankDesc: "يرجى تضمين اسمك الكامل في وصف التحويل. سيتم تجهيز طلبك بعد تأكيد الدفع.",
    orderSummary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    shippingCost: "الشحن",
    free: "مجاني",
    total: "المجموع",
    placeOrder: "إتمام الطلب",
    secure: "دفع آمن بتشفير SSL 256-bit",
    required: "هذا الحقل مطلوب",
    successTitle: "تم استلام طلبك!",
    successDesc: "تم إنشاء طلبك بنجاح. سيتم إرسال بريد إلكتروني للتأكيد قريبًا.",
    backHome: "العودة إلى الصفحة الرئيسية",
    emptyCart: "سلتك فارغة",
    emptyCartDesc: "يرجى إضافة عناصر إلى سلتك قبل الانتقال إلى الدفع.",
    goShopping: "ابدأ التسوق",
    expiryPlaceholder: "MM / YY",
  },
};

const homeLinks = sitePaths.home;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

type PaymentMethod = "card" | "bank";

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
  return digits;
}

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { lang, isRTL } = useLanguage();
  const { addOrder } = useOrders();
  const [, setLocation] = useLocation();
  const tx = t[lang];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const isFreeShipping = cartTotal >= 150;
  const shippingCost = isFreeShipping ? 0 : 29.9;
  const grandTotal = cartTotal + shippingCost;

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const required: (keyof FormData)[] = ["firstName", "lastName", "email", "phone", "address", "city", "district"];
    if (paymentMethod === "card") {
      required.push("cardNumber", "cardName", "expiry", "cvv");
    }
    const newErrors: Partial<FormData> = {};
    required.forEach((f) => {
      if (!form[f].trim()) newErrors[f] = tx.required;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await api.createOrder({
        customerEmail: form.email,
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerPhone: form.phone,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingCountry: "TR",
        notes: paymentMethod === "bank" ? "Havale/EFT ile ödeme" : undefined,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.nameTR,
          quantity: item.quantity,
          price: String(item.price),
        })),
      });

      addOrder({
        orderNumber: result.data.orderNumber,
        status: result.data.status || "pending",
        total: grandTotal,
        subtotal: cartTotal,
        shippingCost,
        createdAt: Date.now(),
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerEmail: form.email,
        shippingAddress: form.address,
        shippingCity: form.city,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: lang === "TR" ? item.nameTR : lang === "EN" ? item.nameEN : item.nameAR,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
      });

      setOrderNumber(result.data.orderNumber);
      setIsSuccess(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Sipariş oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6 pt-24">
          <div className="w-20 h-20 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
            <ShoppingBag size={36} className="text-[#C9A96E]/60" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-[#1C1C1E] mb-3">{tx.emptyCart}</h2>
            <p className="font-body text-sm text-[#1C1C1E]/50">{tx.emptyCartDesc}</p>
          </div>
          <Link
            href={homeLinks[lang]}
            className="font-body text-xs tracking-[0.2em] uppercase bg-[#1C1C1E] text-white px-8 py-3 hover:bg-[#C9A96E] transition-colors duration-300"
          >
            {tx.goShopping}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6 pt-24" dir={isRTL ? "rtl" : "ltr"}>
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="font-display text-3xl text-[#1C1C1E] mb-3">{tx.successTitle}</h2>
            <p className="font-body text-sm text-[#1C1C1E]/60 max-w-md">{tx.successDesc}</p>
            {orderNumber && (
              <p className="font-body text-xs text-[#C9A96E] mt-3 tracking-wider">
                Sipariş No: <span className="font-semibold">{orderNumber}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={homeLinks[lang]}
              className="font-body text-xs tracking-[0.2em] uppercase bg-[#1C1C1E] text-white px-8 py-3 hover:bg-[#C9A96E] transition-colors duration-300"
            >
              {tx.backHome}
            </Link>
            <Link
              href={sitePaths.accountOrders[lang]}
              className="font-body text-xs tracking-[0.2em] uppercase border border-[#1C1C1E] text-[#1C1C1E] px-8 py-3 hover:bg-[#1C1C1E] hover:text-white transition-colors duration-300"
            >
              {lang === "TR" ? "Siparişlerim" : lang === "EN" ? "My Orders" : "طلباتي"}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={homeLinks[lang]}
            className="inline-flex items-center gap-2 font-body text-xs tracking-[0.12em] uppercase text-[#1C1C1E]/50 hover:text-[#C9A96E] transition-colors mb-8"
          >
            <ChevronLeft size={14} className={isRTL ? "rotate-180" : ""} />
            {tx.back}
          </Link>

          <h1 className="font-display text-3xl sm:text-4xl text-[#1C1C1E] mb-10">{tx.title}</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16">
              {/* Left: Form */}
              <div className="space-y-10">
                {/* Contact */}
                <section>
                  <h2 className="font-display text-lg text-[#1C1C1E] mb-5 pb-3 border-b border-[#C9A96E]/20">
                    {tx.contact}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={tx.firstName} error={errors.firstName}>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        className={inputClass(!!errors.firstName)}
                      />
                    </Field>
                    <Field label={tx.lastName} error={errors.lastName}>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        className={inputClass(!!errors.lastName)}
                      />
                    </Field>
                    <Field label={tx.email} error={errors.email}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className={inputClass(!!errors.email)}
                      />
                    </Field>
                    <Field label={tx.phone} error={errors.phone}>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className={inputClass(!!errors.phone)}
                      />
                    </Field>
                  </div>
                </section>

                {/* Shipping Address */}
                <section>
                  <h2 className="font-display text-lg text-[#1C1C1E] mb-5 pb-3 border-b border-[#C9A96E]/20">
                    {tx.shipping}
                  </h2>
                  <div className="space-y-4">
                    <Field label={tx.address} error={errors.address}>
                      <input
                        type="text"
                        placeholder={tx.addressPlaceholder}
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        className={inputClass(!!errors.address)}
                      />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={tx.city} error={errors.city}>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => update("city", e.target.value)}
                          className={inputClass(!!errors.city)}
                        />
                      </Field>
                      <Field label={tx.district} error={errors.district}>
                        <input
                          type="text"
                          value={form.district}
                          onChange={(e) => update("district", e.target.value)}
                          className={inputClass(!!errors.district)}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label={tx.postalCode} error={errors.postalCode}>
                        <input
                          type="text"
                          value={form.postalCode}
                          onChange={(e) => update("postalCode", e.target.value)}
                          className={inputClass(!!errors.postalCode)}
                        />
                      </Field>
                      <Field label={tx.country}>
                        <input
                          type="text"
                          value={tx.turkiye}
                          readOnly
                          className="w-full bg-[#E8E0D5]/50 border border-[#C9A96E]/20 px-4 py-3 font-body text-sm text-[#1C1C1E]/50 cursor-not-allowed"
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <h2 className="font-display text-lg text-[#1C1C1E] mb-5 pb-3 border-b border-[#C9A96E]/20">
                    {tx.payment}
                  </h2>

                  {/* Payment Method Tabs */}
                  <div className="flex gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border font-body text-sm tracking-wide transition-colors duration-200 ${
                        paymentMethod === "card"
                          ? "border-[#C9A96E] bg-[#C9A96E]/5 text-[#1C1C1E]"
                          : "border-[#C9A96E]/20 text-[#1C1C1E]/50 hover:border-[#C9A96E]/50"
                      }`}
                    >
                      <CreditCard size={16} />
                      {tx.creditCard}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border font-body text-sm tracking-wide transition-colors duration-200 ${
                        paymentMethod === "bank"
                          ? "border-[#C9A96E] bg-[#C9A96E]/5 text-[#1C1C1E]"
                          : "border-[#C9A96E]/20 text-[#1C1C1E]/50 hover:border-[#C9A96E]/50"
                      }`}
                    >
                      <Building2 size={16} />
                      {tx.bankTransfer}
                    </button>
                  </div>

                  {paymentMethod === "card" ? (
                    <div className="space-y-4">
                      <Field label={tx.cardNumber} error={errors.cardNumber}>
                        <input
                          type="text"
                          value={form.cardNumber}
                          onChange={(e) => update("cardNumber", formatCardNumber(e.target.value))}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className={inputClass(!!errors.cardNumber)}
                        />
                      </Field>
                      <Field label={tx.cardName} error={errors.cardName}>
                        <input
                          type="text"
                          value={form.cardName}
                          onChange={(e) => update("cardName", e.target.value.toUpperCase())}
                          className={inputClass(!!errors.cardName)}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label={tx.expiry} error={errors.expiry}>
                          <input
                            type="text"
                            value={form.expiry}
                            onChange={(e) => update("expiry", formatExpiry(e.target.value))}
                            placeholder={tx.expiryPlaceholder}
                            maxLength={7}
                            className={inputClass(!!errors.expiry)}
                          />
                        </Field>
                        <Field label={tx.cvv} error={errors.cvv}>
                          <input
                            type="text"
                            value={form.cvv}
                            onChange={(e) => update("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className={inputClass(!!errors.cvv)}
                          />
                        </Field>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#E8E0D5]/40 border border-[#C9A96E]/20 p-6 space-y-2">
                      <p className="font-body text-sm text-[#1C1C1E]/70 mb-3">{tx.bankInfo}</p>
                      <p className="font-body text-sm font-semibold text-[#1C1C1E]">{tx.bankName}</p>
                      <p className="font-body text-sm font-semibold text-[#1C1C1E]">{tx.iban}</p>
                      <p className="font-body text-xs text-[#1C1C1E]/50 mt-3 leading-relaxed">{tx.bankDesc}</p>
                    </div>
                  )}
                </section>
              </div>

              {/* Right: Order Summary */}
              <div>
                <div className="bg-white border border-[#C9A96E]/15 p-6 sticky top-28">
                  <h2 className="font-display text-lg text-[#1C1C1E] mb-5 pb-3 border-b border-[#C9A96E]/20">
                    {tx.orderSummary}
                  </h2>

                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => {
                      const name = lang === "TR" ? item.nameTR : lang === "EN" ? item.nameEN : item.nameAR;
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-14 h-16 bg-[#E8E0D5] flex-shrink-0 overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag size={16} className="text-[#C9A96E]/30" />
                              </div>
                            )}
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1C1C1E] rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-[10px] tracking-[0.12em] uppercase text-[#C9A96E] mb-0.5">
                              {item.collection}
                            </p>
                            <p className="font-display text-sm text-[#1C1C1E] truncate">{name}</p>
                          </div>
                          <p className="font-body text-sm text-[#1C1C1E] font-medium flex-shrink-0">
                            ₺{(item.price * item.quantity).toLocaleString("tr-TR")}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#C9A96E]/20 pt-4 space-y-2">
                    <div className="flex justify-between font-body text-sm text-[#1C1C1E]/60">
                      <span>{tx.subtotal}</span>
                      <span>₺{cartTotal.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm text-[#1C1C1E]/60">
                      <span>{tx.shippingCost}</span>
                      <span className={isFreeShipping ? "text-emerald-600 font-medium" : ""}>
                        {isFreeShipping ? tx.free : "₺29,90"}
                      </span>
                    </div>
                    <div className="flex justify-between font-display text-base text-[#1C1C1E] pt-3 border-t border-[#C9A96E]/20">
                      <span>{tx.total}</span>
                      <span>
                        ₺{grandTotal.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {submitError && (
                    <p className="mt-4 font-body text-xs text-red-500 text-center">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#1C1C1E] text-white font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-[#C9A96E] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "İşleniyor..." : tx.placeOrder}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-[#1C1C1E]/40">
                    <Lock size={11} />
                    <span className="font-body text-[10px] tracking-wide">{tx.secure}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full bg-white border ${
    hasError ? "border-red-400" : "border-[#C9A96E]/20"
  } px-4 py-3 font-body text-sm text-[#1C1C1E] placeholder:text-[#1C1C1E]/30 focus:outline-none focus:border-[#C9A96E] transition-colors`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-[#1C1C1E]/60 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 font-body text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
