"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function ContactoPage() {
  const { lang } = useLang();
  const l = translations[lang];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent">(
    "idle"
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    const subject = `Contact from ${formData.name}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "N/A"}\n\n${formData.message}`;
    window.location.href = `mailto:hola@jesuseselcamino.com.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      setFormStatus("sent");
      setTimeout(() => {
        setFormStatus("idle");
        setFormData({ name: "", email: "", phone: "", message: "" });
      }, 4000);
    }, 1000);
  };

  return (
    <>
      <PageHero
        image="/iglesia/worship.jpg"
        label={l.contactLabel}
        title={l.contactTitle1}
        titleAccent={l.contactTitle2}
        allowOverlap
      />

      {/* ═══ Overlapping Contact Info Cards ═══ */}
      <section className="bg-[#FAF8F5] pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 -mt-12 sm:-mt-16 lg:-mt-20">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Phone Card */}
              <FadeIn delay={0}>
                <div className="bg-white rounded-xl p-8 text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-14 h-14 bg-[#C9A86C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6 text-[#C9A86C]" />
                  </div>
                  <h3 className="text-[#4A3F35] font-semibold text-sm mb-3" style={serif}>
                    {l.contactCallUs}
                  </h3>
                  <a href="tel:0433370537" className="text-[#6B5D4D] text-sm hover:text-[#C9A86C] block transition-colors">
                    0433 370 537
                  </a>
                  <a href="tel:0406947072" className="text-[#6B5D4D] text-sm hover:text-[#C9A86C] block mt-1 transition-colors">
                    0406 947 072
                  </a>
                </div>
              </FadeIn>

              {/* Email Card */}
              <FadeIn delay={150}>
                <div className="bg-white rounded-xl p-8 text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-14 h-14 bg-[#C9A86C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-[#C9A86C]" />
                  </div>
                  <h3 className="text-[#4A3F35] font-semibold text-sm mb-3" style={serif}>
                    {l.email}
                  </h3>
                  <a href="mailto:hola@jesuseselcamino.com.au" className="text-[#6B5D4D] text-sm hover:text-[#C9A86C] transition-colors">
                    hola@jesuseselcamino.com.au
                  </a>
                </div>
              </FadeIn>

              {/* Location Card */}
              <FadeIn delay={300}>
                <div className="bg-white rounded-xl p-8 text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-14 h-14 bg-[#C9A86C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-[#C9A86C]" />
                  </div>
                  <h3 className="text-[#4A3F35] font-semibold text-sm mb-3" style={serif}>
                    {l.address}
                  </h3>
                  <p className="text-[#6B5D4D] text-sm">
                    73 Nollamara Ave<br />
                    Nollamara WA 6061
                  </p>
                  <a
                    href="https://maps.google.com/?q=73+Nollamara+Ave+Nollamara+WA+6061+Australia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#C9A86C] hover:text-[#B8956A] text-xs mt-3 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    {l.openMaps}
                  </a>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Contact Form (dark section) ═══ */}
      <section className="py-24 md:py-32 bg-[#4A3F35]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-12">
              <h3 className="text-2xl text-[#C9A86C] mb-2 text-center" style={serif}>
                {l.formTitle}
              </h3>
              <p className="text-white/50 text-sm text-center mb-8">
                {l.contactHeroDesc}
              </p>

              {formStatus === "sent" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-14 h-14 text-[#C9A86C] mb-4" />
                  <p className="text-white text-lg" style={serif}>
                    {l.formSuccess}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/70 text-xs tracking-wide uppercase mb-2">
                        {l.formName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder={l.formNamePh}
                        className="w-full bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs tracking-wide uppercase mb-2">
                        {l.formEmail} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder={l.formEmailPh}
                        className="w-full bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs tracking-wide uppercase mb-2">
                      {l.formPhone}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder={l.formPhonePh}
                      className="w-full bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs tracking-wide uppercase mb-2">
                      {l.formMessage} *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder={l.formMessagePh}
                      className="w-full bg-white/5 border border-white/15 rounded-lg text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formStatus === "sending"}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] disabled:opacity-60 text-white px-8 py-3.5 rounded-full text-sm font-medium tracking-wide uppercase transition-all"
                  >
                    {formStatus === "sending" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {l.formSending}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {l.formSubmit}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
