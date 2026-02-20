"use client";

import Link from "next/link";
import { BookOpen, Palette, Music, ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function KidsMinistryPage() {
  const { lang } = useLang();
  const l = translations[lang];

  const features = [
    { icon: BookOpen, title: l.kidsFeature1Title, desc: l.kidsFeature1Desc },
    { icon: Palette, title: l.kidsFeature2Title, desc: l.kidsFeature2Desc },
    { icon: Music, title: l.kidsFeature3Title, desc: l.kidsFeature3Desc },
  ];

  return (
    <>
      <PageHero
        image="/iglesia/children.jpg"
        label={l.kidsPageLabel}
        title={l.kidsPageTitle1}
        titleAccent={l.kidsPageTitle2}
        allowOverlap
      />

      {/* ═══ Intro Card (overlapping hero) ═══ */}
      <section className="py-16 px-4 sm:px-6 -mt-12 sm:-mt-16 lg:-mt-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-12 text-center">
              <Link href="/iglesia/ministerios" className="inline-flex items-center gap-1.5 text-[#C9A86C] text-sm font-medium mb-6 hover:underline">
                <ArrowLeft className="w-4 h-4" />
                {l.ministryBackToAll}
              </Link>
              <p className="text-xl md:text-2xl font-light text-[#4A3F35] italic leading-relaxed" style={serif}>
                {l.kidsVerse}
              </p>
              <p className="text-[#C9A86C] font-semibold mt-4">{l.kidsVerseRef}</p>
              <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto my-6" />
              <p className="text-[#6B5D4D] text-base sm:text-lg leading-relaxed">{l.kidsIntroDesc}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ What We Do ═══ */}
      <section className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">{l.ministryWhatWeDo}</p>
            <h2 className="text-3xl sm:text-4xl text-[#4A3F35] mb-4" style={serif}>
              <span className="font-light">{l.kidsPageTitle1} </span>
              <span className="font-bold">{l.kidsPageTitle2}</span>
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto" />
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 150} variant="fade-up">
                <div className="bg-white rounded-xl p-8 sm:p-10 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C9A86C]/10 flex items-center justify-center">
                    <f.icon className="w-7 h-7 text-[#C9A86C]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#4A3F35] mb-3" style={serif}>{f.title}</h3>
                  <p className="text-[#6B5D4D] leading-relaxed text-sm">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Meet the Leader ═══ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn variant="fade-right" className="relative">
              <div className="overflow-hidden rounded-xl shadow-xl">
                <img src="/iglesia/leaders/clara.jpeg" alt={l.sundaySchoolLeader} className="w-full aspect-[3/4] object-cover" />
              </div>
            </FadeIn>

            <FadeIn delay={200} variant="fade-left">
              <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">{l.ministryMeetLeader}</p>
              <h2 className="text-3xl sm:text-4xl text-[#4A3F35] mb-2" style={serif}>
                <span className="font-bold text-[#C9A86C]">Clara Osorio</span>
              </h2>
              <p className="text-[#6B5D4D] text-sm mb-6">{l.sundaySchoolTitle}</p>
              <div className="w-16 h-0.5 bg-[#C9A86C] mb-8" />
              <p className="text-[#6B5D4D] text-lg leading-relaxed mb-6">{l.kidsLeaderBio}</p>
              <div className="flex flex-wrap gap-4 text-sm text-[#6B5D4D] border-t border-[#E8E0D5] pt-6">
                <span>{l.sundaySchoolSchedule}</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-4 sm:px-6 bg-[#4A3F35]">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-[#C9A86C] font-medium tracking-[0.2em] uppercase text-sm mb-4">{l.ministryJoinLabel}</p>
            <h2 className="text-4xl font-light text-white mb-6" style={serif}>{l.kidsCTATitle}</h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">{l.kidsCTADesc}</p>
            <Link href="/iglesia/contacto" className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white font-semibold px-8 py-4 text-lg rounded-full transition-colors shadow-lg">
              {l.ministryJoinButton}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
