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
        title={l.contactTitle}
      />

      <section className="py-24 md:py-32 bg-[#4A3F35]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              {l.contactHeroDesc}
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Left column — Contact info + Location */}
            <div className="lg:col-span-2 space-y-10">
              <FadeIn variant="fade-right">
                <h3 className="text-xl text-[#C9A86C] mb-6" style={serif}>
                  {l.contactUs}
                </h3>
                <div className="space-y-5">
                  {[
                    {
                      icon: Phone,
                      label: "Pastor Morris Velasquez",
                      value: "0433 370 537",
                      href: "tel:0433370537",
                    },
                    {
                      icon: Phone,
                      label: "Daisy Velasquez",
                      value: "0406 947 072",
                      href: "tel:0406947072",
                    },
                    {
                      icon: Mail,
                      label: l.email,
                      value: "hola@jesuseselcamino.com.au",
                      href: "mailto:hola@jesuseselcamino.com.au",
                    },
                  ].map((contact) => (
                    <div key={contact.label} className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white/10 flex items-center justify-center flex-shrink-0">
                        <contact.icon className="w-5 h-5 text-[#C9A86C]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {contact.label}
                        </p>
                        <a
                          href={contact.href}
                          className="text-white/60 hover:text-[#C9A86C] transition-colors text-sm"
                        >
                          {contact.value}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={100} variant="fade-right">
                <h3 className="text-xl text-[#C9A86C] mb-6" style={serif}>
                  {l.findUs}
                </h3>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-11 h-11 bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-5 h-5 text-[#C9A86C]" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm mb-1">
                      {l.address}
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      73 Nollamara Ave
                      <br />
                      Nollamara WA 6061
                      <br />
                      Australia
                    </p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=73+Nollamara+Ave+Nollamara+WA+6061+Australia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white px-6 py-2.5 text-sm font-medium tracking-wide uppercase transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {l.openMaps}
                </a>
              </FadeIn>
            </div>

            {/* Right column — Contact Form */}
            <FadeIn delay={200} variant="fade-left" className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 sm:p-10">
                <h3 className="text-xl text-[#C9A86C] mb-8" style={serif}>
                  {l.formTitle}
                </h3>

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
                          className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
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
                          className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
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
                        className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
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
                        className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formStatus === "sending"}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] disabled:opacity-60 text-white px-8 py-3.5 text-sm font-medium tracking-wide uppercase transition-all"
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
        </div>
      </section>
    </>
  );
}
