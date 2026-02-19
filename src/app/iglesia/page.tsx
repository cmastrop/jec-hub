"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, MapPin, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { SectionHeading } from "@/components/iglesia/section-heading";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function IglesiaPage() {
  const { lang } = useLang();
  const l = translations[lang];
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/iglesia/hero-service.jpg"
          alt="Church service"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f14]/70 via-[#1a1510]/50 to-[#0f0c08]/80" />

        <div
          className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ease-out ${
            heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <img
            src="/iglesia/logo.png"
            alt="Jesus Es El Camino"
            className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-8 rounded-full shadow-2xl shadow-black/40 ring-2 ring-[#C9A86C]/30"
          />

          <p className="text-[#C9A86C] tracking-[0.3em] text-xs sm:text-sm uppercase mb-6">
            {l.heroLabel}
          </p>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl text-white mb-6 leading-tight font-light"
            style={{ ...serif, textShadow: "4px 4px 16px rgba(0,0,0,0.5)" }}
          >
            {l.heroLine1}{" "}
            <span
              className="text-[#C9A86C] font-bold"
              style={{ textShadow: "2px 2px 12px rgba(201,168,108,0.4)" }}
            >
              {l.heroAccent}
            </span>
          </h1>

          <p
            className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-light mb-8"
            style={serif}
          >
            {l.heroSubtitle}
          </p>

          <div className="max-w-2xl mx-auto space-y-3 mb-12">
            <p className="text-white/70 text-sm sm:text-base leading-relaxed italic">
              {l.heroDesc1}
            </p>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed">
              {l.heroDesc2}
            </p>
          </div>

          <Link
            href="/iglesia/contacto"
            className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white font-medium px-10 py-4 rounded-full text-sm tracking-wide transition-all shadow-lg uppercase hover:scale-105 active:scale-95"
          >
            {l.heroCta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 delay-[2000ms] ${
            heroReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-1.5 bg-[#C9A86C] rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══ SERVICE TIMES (overlapping hero) ═══ */}
      <section className="pb-24 md:pb-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overlapping cards */}
          <div className="relative z-10 -mt-12 sm:-mt-16 lg:-mt-20 mb-16">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Sunday */}
              <FadeIn delay={200}>
                <div className="group relative overflow-hidden bg-white rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src="/iglesia/preaching.jpg"
                      alt={l.sundayTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4A3F35]/80 via-[#4A3F35]/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-[#C9A86C] rounded-lg flex items-center justify-center">
                        <Sun className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-xl text-[#4A3F35] mb-2" style={serif}>
                      {l.sundayTitle}
                    </h3>
                    <p className="text-2xl font-semibold text-[#C9A86C] mb-1">
                      3:00 PM — 5:00 PM
                    </p>
                    <p className="text-sm text-[#6B5D4D]">{l.sundayDesc}</p>
                  </div>
                </div>
              </FadeIn>

              {/* Wednesday */}
              <FadeIn delay={350}>
                <div className="group relative overflow-hidden bg-white rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src="/iglesia/worship.jpg"
                      alt={l.wednesdayTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4A3F35]/80 via-[#4A3F35]/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-[#4A3F35] rounded-lg flex items-center justify-center">
                        <Moon className="w-6 h-6 text-[#C9A86C]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-xl text-[#4A3F35] mb-2" style={serif}>
                      {l.wednesdayTitle}
                    </h3>
                    <p className="text-2xl font-semibold text-[#C9A86C] mb-1">
                      7:30 PM — 9:00 PM
                    </p>
                    <p className="text-sm text-[#6B5D4D]">{l.wednesdayDesc}</p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          <FadeIn variant="scale-in">
            <SectionHeading label={l.servicesLabel} title={l.servicesTitle1} titleAccent={l.servicesTitle2} />
          </FadeIn>

          <FadeIn className="flex items-center justify-center gap-3">
            <MapPin className="w-5 h-5 text-[#C9A86C]" />
            <a
              href="https://maps.google.com/?q=73+Nollamara+Ave+Nollamara+WA+6061+Australia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B5D4D] hover:text-[#C9A86C] transition-colors text-base sm:text-lg"
            >
              73 Nollamara Ave, Nollamara WA 6061, Australia
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ═══ MINISTRIES PREVIEW ═══ */}
      <section className="py-24 md:py-32 bg-[#F5F0E8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn variant="scale-in">
            <SectionHeading label={l.ministriesLabel} title={l.ministriesTitle1} titleAccent={l.ministriesTitle2} />
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {[
              { title: l.mensTitle, desc: l.mensDesc, img: "/iglesia/mens-group.jpg" },
              { title: l.womensTitle, desc: l.womensDesc, img: "/iglesia/womens-group.jpg" },
              { title: l.youthTitle, subtitle: "Zoe Zone", desc: l.youthDesc, img: "/iglesia/youth.jpg" },
              { title: l.sundaySchoolTitle, desc: l.sundaySchoolDesc, img: "/iglesia/children.jpg" },
            ].map((ministry, i) => (
              <FadeIn key={ministry.title} delay={i * 120} variant={i % 2 === 0 ? "fade-right" : "fade-left"}>
                <div className="group relative overflow-hidden h-72 sm:h-80 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                  <img
                    src={ministry.img}
                    alt={ministry.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f14]/90 via-[#2a1f14]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <p className="text-[#C9A86C] tracking-[0.2em] text-xs uppercase mb-2">
                      {l.ministryTag}
                    </p>
                    <h3 className="text-xl sm:text-2xl text-white mb-1" style={serif}>
                      {ministry.title}
                    </h3>
                    {ministry.subtitle && (
                      <p className="text-[#C9A86C] text-sm italic mb-2">{ministry.subtitle}</p>
                    )}
                    <p className="text-white/70 text-sm leading-relaxed">{ministry.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-12">
            <Link
              href="/iglesia/ministerios"
              className="inline-flex items-center gap-2 text-[#C9A86C] hover:text-[#B8956A] font-medium tracking-wide transition-colors"
            >
              {lang === "en" ? "View All Ministries" : "Ver Todos los Ministerios"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CHURCH LIFE GALLERY ═══ */}
      <section className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn variant="scale-in">
            <SectionHeading label={l.galleryLabel} title={l.galleryTitle1} titleAccent={l.galleryTitle2} />
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto auto-rows-[180px] sm:auto-rows-[220px]">
            <FadeIn delay={0} variant="scale-in" className="col-span-2 row-span-2">
              <div className="group overflow-hidden rounded-xl h-full">
                <img
                  src="/iglesia/worship.jpg"
                  alt="Worship"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </FadeIn>
            <FadeIn delay={100} variant="fade-left">
              <div className="group overflow-hidden rounded-xl h-full">
                <img
                  src="/iglesia/preaching.jpg"
                  alt="Preaching"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </FadeIn>
            <FadeIn delay={200} variant="fade-left">
              <div className="group overflow-hidden rounded-xl h-full">
                <img
                  src="/iglesia/musicians.jpg"
                  alt="Musicians"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </FadeIn>
            <FadeIn delay={300} variant="fade-up">
              <div className="group overflow-hidden rounded-xl h-full">
                <img
                  src="/iglesia/youth.jpg"
                  alt="Youth"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </FadeIn>
            <FadeIn delay={400} variant="fade-up">
              <div className="group overflow-hidden rounded-xl h-full">
                <img
                  src="/iglesia/children.jpg"
                  alt="Children"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIES ═══ */}
      <section className="py-24 md:py-32 bg-[#F5F0E8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn variant="scale-in">
            <SectionHeading label={l.testimoniesLabel} title={l.testimoniesTitle} />
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { quote: l.testimony1Quote, name: l.testimony1Name, role: l.testimony1Role },
              { quote: l.testimony2Quote, name: l.testimony2Name, role: l.testimony2Role },
              { quote: l.testimony3Quote, name: l.testimony3Name, role: l.testimony3Role },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 150} variant="fade-up">
                <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                  <div
                    className="text-[#C9A86C]/20 text-6xl leading-none mb-4"
                    style={serif}
                  >
                    &ldquo;
                  </div>
                  <p className="text-[#6B5D4D] text-sm leading-relaxed flex-1 italic">
                    {t.quote}
                  </p>
                  <div className="mt-6 pt-4 border-t border-[#E8E0D5]">
                    <p className="text-[#4A3F35] font-semibold text-sm">{t.name}</p>
                    <p className="text-[#C9A86C] text-xs tracking-wide">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <img
          src="/iglesia/worship.jpg"
          alt="Worship"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-[#2a1f14]/85" />

        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#C9A86C] rounded-full opacity-5" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#C9A86C] rounded-full opacity-5" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white rounded-full opacity-5" />

        <FadeIn className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-white mb-6 leading-tight"
            style={serif}
          >
            <span className="font-light">{l.ctaTitle}</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            {l.ctaDesc}
          </p>
          <Link
            href="/iglesia/contacto"
            className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white font-medium px-10 py-4 rounded-full text-sm tracking-wide transition-all shadow-lg uppercase hover:scale-105 active:scale-95"
          >
            {l.ctaButton}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
