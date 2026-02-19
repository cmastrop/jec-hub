"use client";

import { BookOpen, Send, Heart } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";
import { SectionHeading } from "@/components/iglesia/section-heading";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function NosotrosPage() {
  const { lang } = useLang();
  const l = translations[lang];

  return (
    <>
      <PageHero
        image="/iglesia/speaker.jpg"
        label={l.aboutLabel}
        title={l.aboutTitle}
      />

      {/* ═══ VISION — 3 Pillars ═══ */}
      <section className="py-24 md:py-32 bg-[#F5F0E8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading label={l.visionLabel} title={l.visionTitle} />
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: l.equipTitle, desc: l.equipDesc, accent: "#C9A86C" },
              { icon: Send, title: l.sendTitle, desc: l.sendDesc, accent: "#4A3F35" },
              { icon: Heart, title: l.reachTitle, desc: l.reachDesc, accent: "#C9A86C" },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 150}>
                <div className="group bg-white p-8 sm:p-10 text-center shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-500 h-full">
                  <div
                    className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: item.accent, opacity: 0.1 }}
                  />
                  <div className="w-16 h-16 mx-auto -mt-16 mb-6 flex items-center justify-center relative">
                    <item.icon className="w-7 h-7" style={{ color: item.accent }} />
                  </div>
                  <h3
                    className="text-lg tracking-[0.15em] mb-4"
                    style={{ ...serif, color: item.accent }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[#6B5D4D] leading-relaxed text-sm">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MISSION ═══ */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <img
          src="/iglesia/worship.jpg"
          alt="Worship"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-[#2a1f14]/85" />
        <FadeIn className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-6">
            {l.missionLabel}
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-6xl text-white mb-4 leading-tight"
            style={serif}
          >
            {l.missionLine1}
            <br />
            <span className="text-[#C9A86C]">{l.missionLine2}</span>
          </h2>
          <h3
            className="text-lg sm:text-xl font-light text-white/80 mb-10"
            style={serif}
          >
            {l.missionSubtitle}
          </h3>
          <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mb-10" />
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-white/70 text-base sm:text-lg leading-relaxed italic">
              {l.missionDesc1}
            </p>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed">
              {l.missionDesc2}
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ═══ PASTORS ═══ */}
      <section className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn variant="fade-right" className="relative">
              <div className="overflow-hidden shadow-xl">
                <img
                  src="/iglesia/pastors.jpg"
                  alt="Pastor Morris & Daisy Velasquez"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#C9A86C] text-white p-6 hidden md:block shadow-lg">
                <p className="text-3xl font-semibold" style={serif}>Since</p>
                <p className="text-4xl font-bold" style={serif}>1990</p>
              </div>
            </FadeIn>

            <FadeIn delay={200} variant="fade-left">
              <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
                {l.pastorsLabel}
              </p>
              <h2 className="text-3xl sm:text-4xl text-[#4A3F35] mb-6" style={serif}>
                Pastor Morris &amp;{" "}
                <span className="text-[#C9A86C]">Daisy Velasquez</span>
              </h2>
              <div className="w-16 h-0.5 bg-[#C9A86C] mb-8" />
              <p className="text-[#6B5D4D] text-lg leading-relaxed mb-6">
                {l.pastorsDesc1}
              </p>
              <p className="text-[#6B5D4D] text-base leading-relaxed mb-8">
                {l.pastorsDesc2}
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-[#E8E0D5] pt-8">
                <div>
                  <p className="text-3xl text-[#C9A86C]" style={serif}>35+</p>
                  <p className="text-sm text-[#6B5D4D] mt-1">{l.statYears}</p>
                </div>
                <div>
                  <p className="text-3xl text-[#C9A86C]" style={serif}>2</p>
                  <p className="text-sm text-[#6B5D4D] mt-1">{l.statLanguages}</p>
                </div>
                <div>
                  <p className="text-3xl text-[#C9A86C]" style={serif}>1</p>
                  <p className="text-sm text-[#6B5D4D] mt-1">{l.statFamily}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
