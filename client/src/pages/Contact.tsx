import { useState } from "react";
import { Mail, Clock, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
  const { lang } = useLanguage();
  
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  
  const getText = (tr: string, en: string, ar: string) => {
    if (lang === "TR") return tr;
    if (lang === "EN") return en;
    return ar;
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
              {getText("İletişim", "Contact", "اتصل بنا")}
            </p>
            <h1 className="font-display text-5xl lg:text-6xl text-[#1C1C1E]">
              {getText("Bize Ulaşın", "Get in Touch", "Get in Touch")}
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <p className="font-body text-sm text-[#1C1C1E]/70 leading-relaxed mb-10">
                {lang === "TR"
                  ? "Sorularınız, özel siparişleriniz veya iş birliği teklifleriniz için bizimle iletişime geçebilirsiniz. En kısa sürede yanıt vereceğiz."
                  : "You can contact us for your questions, custom orders or collaboration proposals. We will respond as soon as possible."}
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C9A96E]/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-[#C9A96E]" />
                  </div>
                  <div>
                    <p className="font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/40 mb-1">Email</p>
                    <a href="mailto:info@voilee.com.tr" className="font-body text-sm text-[#1C1C1E] hover:text-[#C9A96E] transition-colors">
                      info@voilee.com.tr
                    </a>
                  </div>
                </div>

                {/* WhatsApp numarası buraya eklenecek */}

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C9A96E]/10 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-[#C9A96E]" />
                  </div>
                  <div>
                    <p className="font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/40 mb-1">
                      {getText("Çalışma Saatleri", "Working Hours", "Working Hours")}
                    </p>
                    <p className="font-body text-sm text-[#1C1C1E]">
                      {getText("Pazartesi — Cuma, 09:00 — 18:00", "Monday — Friday, 09:00 — 18:00", "Monday — Friday, 09:00 — 18:00")}
                    </p>
                    <p className="font-body text-xs text-[#1C1C1E]/40 mt-1">
                      {getText("Türkiye saati (GMT+3)", "Turkey time (GMT+3)", "Turkey time (GMT+3)")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C9A96E]/10 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-[#C9A96E]" />
                  </div>
                  <div>
                    <p className="font-body text-xs tracking-[0.15em] uppercase text-[#1C1C1E]/40 mb-1">
                      {getText("Konum", "Location", "Location")}
                    </p>
                    <p className="font-body text-sm text-[#1C1C1E]">İstanbul, Türkiye</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-[#1C1C1E]">
                <p className="font-body text-xs tracking-[0.15em] uppercase text-[#C9A96E] mb-3">
                  {getText("Uluslararası Sorular", "International Inquiries", "International Inquiries")}
                </p>
                <p className="font-body text-sm text-[#F7F3EC]/70 leading-relaxed">
                  {lang === "TR"
                    ? "Yurt dışı siparişler ve toplu alımlar için özel destek sunuyoruz. İngilizce iletişim için aynı kanalları kullanabilirsiniz."
                    : "We offer special support for international orders and bulk purchases. You can use the same channels for English communication."}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-16 h-16 bg-[#C9A96E]/10 flex items-center justify-center mb-6">
                    <Send size={24} className="text-[#C9A96E]" />
                  </div>
                  <h3 className="font-display text-2xl text-[#1C1C1E] mb-3">
                    {getText("Mesajınız Alındı", "Message Received", "Message Received")}
                  </h3>
                  <p className="font-body text-sm text-[#1C1C1E]/60">
                    {lang === "TR"
                      ? "En kısa sürede size geri döneceğiz."
                      : "We will get back to you as soon as possible."}
                  </p>
                  <button onClick={() => setSent(false)} className="mt-6 btn-luxury text-sm">
                    {getText("Yeni Mesaj", "New Message", "New Message")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/50 mb-2 block">
                        {getText("Adınız", "Your Name", "Your Name")}
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-transparent border border-[#1C1C1E]/20 px-4 py-3 font-body text-sm text-[#1C1C1E] focus:outline-none focus:border-[#C9A96E] transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/50 mb-2 block">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-transparent border border-[#1C1C1E]/20 px-4 py-3 font-body text-sm text-[#1C1C1E] focus:outline-none focus:border-[#C9A96E] transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/50 mb-2 block">
                      {getText("Konu", "Subject", "Subject")}
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-[#F7F3EC] border border-[#1C1C1E]/20 px-4 py-3 font-body text-sm text-[#1C1C1E] focus:outline-none focus:border-[#C9A96E] transition-colors"
                      required
                    >
                      <option value="">{getText("Konu Seçin", "Select Subject", "Select Subject")}</option>
                      <option value="order">{getText("Sipariş Hakkında", "About Order", "About Order")}</option>
                      <option value="product">{getText("Ürün Sorusu", "Product Question", "Product Question")}</option>
                      <option value="custom">{getText("Özel Sipariş", "Custom Order", "Custom Order")}</option>
                      <option value="wholesale">{getText("Toplu Alım", "Wholesale", "Wholesale")}</option>
                      <option value="press">{getText("Basın & İş Birliği", "Press & Collaboration", "Press & Collaboration")}</option>
                      <option value="other">{getText("Diğer", "Other", "Other")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs tracking-[0.1em] uppercase text-[#1C1C1E]/50 mb-2 block">
                      {getText("Mesajınız", "Your Message", "Your Message")}
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={6}
                      className="w-full bg-transparent border border-[#1C1C1E]/20 px-4 py-3 font-body text-sm text-[#1C1C1E] focus:outline-none focus:border-[#C9A96E] transition-colors resize-none"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-luxury btn-luxury-filled w-full justify-center">
                    <Send size={14} />
                    {getText("Mesaj Gönder", "Send Message", "Send Message")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
