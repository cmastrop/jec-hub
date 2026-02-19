"use client";

import Link from "next/link";
import {
  Heart,
  Building2,
  Gift,
  HandHeart,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function DonarPage() {
  const { lang } = useLang();
  const l = translations[lang];

  const impacts = [
    {
      icon: Heart,
      title: l.giveImpact2Title,
      desc: l.giveImpact2Desc,
    },
    {
      icon: Building2,
      title: l.giveImpact1Title,
      desc: l.giveImpact1Desc,
    },
    {
      icon: Gift,
      title: l.giveImpact4Title,
      desc: l.giveImpact4Desc,
    },
    {
      icon: HandHeart,
      title: l.giveImpact3Title,
      desc: l.giveImpact3Desc,
    },
  ];

  return (
    <>
      <PageHero
        image="/iglesia/worship.jpg"
        label={l.giveLabel}
        title={l.giveTitle1}
        titleAccent={l.giveTitle2}
      />

      {/* ═══ Scripture Quote ═══ */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p
              className="text-2xl md:text-3xl font-light text-[#4A3F35] italic leading-relaxed"
              style={serif}
            >
              {l.giveVerse}
            </p>
            <p className="text-[#C9A86C] font-semibold mt-6">
              {l.giveVerseRef}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Donation Info + Impact (2-col layout) ═══ */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: Ways to Give */}
            <FadeIn variant="fade-right">
              <div>
                <h2
                  className="text-3xl font-light text-[#4A3F35] mb-2"
                  style={serif}
                >
                  {lang === "en" ? "Ways to " : "Formas de "}
                  <span className="font-semibold">
                    {lang === "en" ? "Give" : "Dar"}
                  </span>
                </h2>
                <p className="text-[#6B5D4D] mb-8">{l.giveWhyDesc}</p>

                {/* Giving methods card */}
                <div className="bg-white rounded-xl shadow-xl p-8 space-y-6">
                  {/* Bank Transfer */}
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-[#C9A86C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[#C9A86C]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A3F35] mb-1">
                        {l.giveBankTitle}
                      </h3>
                      <p className="text-[#6B5D4D] text-sm">
                        {l.giveBankDesc}
                      </p>
                    </div>
                  </div>

                  {/* In Person */}
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-[#C9A86C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#C9A86C]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A3F35] mb-1">
                        {l.giveInPersonTitle}
                      </h3>
                      <p className="text-[#6B5D4D] text-sm">
                        {l.giveInPersonDesc}
                      </p>
                    </div>
                  </div>

                  {/* Online */}
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-[#C9A86C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-[#C9A86C]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A3F35] mb-1">
                        {l.giveOnlineTitle}
                      </h3>
                      <p className="text-[#6B5D4D] text-sm">
                        {l.giveOnlineDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Details */}
                <div className="mt-8 p-6 bg-white rounded-xl border border-[#E8E0D5]">
                  <h3 className="font-semibold text-[#4A3F35] mb-4">
                    {lang === "en"
                      ? "Bank Transfer Details"
                      : "Datos para Transferencia"}
                  </h3>
                  <div className="space-y-2 text-[#6B5D4D] text-sm">
                    <p>
                      <span className="font-medium">
                        {lang === "en" ? "Bank:" : "Banco:"}
                      </span>{" "}
                      Commonwealth Bank
                    </p>
                    <p>
                      <span className="font-medium">
                        {lang === "en" ? "Account Name:" : "Nombre:"}
                      </span>{" "}
                      Jesus Es El Camino Church
                    </p>
                    <p>
                      <span className="font-medium">BSB:</span> —
                    </p>
                    <p>
                      <span className="font-medium">
                        {lang === "en" ? "Account:" : "Cuenta:"}
                      </span>{" "}
                      —
                    </p>
                    <p className="text-xs text-[#6B5D4D]/60 mt-2 italic">
                      {lang === "en"
                        ? "Contact us for full bank details."
                        : "Contáctanos para los datos bancarios completos."}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Right: Your Giving Impact */}
            <div>
              <FadeIn variant="fade-left">
                <h2
                  className="text-3xl font-light text-[#4A3F35] mb-2"
                  style={serif}
                >
                  {lang === "en" ? "Your Giving " : "Tu "}
                  <span className="font-semibold">
                    {lang === "en" ? "Impact" : "Impacto"}
                  </span>
                </h2>
                <p className="text-[#6B5D4D] mb-8">{l.giveHeroDesc}</p>
              </FadeIn>

              <div className="space-y-6">
                {impacts.map((impact, i) => (
                  <FadeIn key={i} delay={i * 120} variant="fade-left">
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 flex gap-4">
                      <div className="w-14 h-14 bg-[#C9A86C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <impact.icon className="w-7 h-7 text-[#C9A86C]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#4A3F35] mb-1">
                          {impact.title}
                        </h3>
                        <p className="text-[#6B5D4D] text-sm">{impact.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              {/* Tax info box */}
              <FadeIn delay={500} variant="fade-left">
                <div className="mt-8 p-6 bg-[#4A3F35] rounded-xl text-white">
                  <h3 className="font-semibold mb-2">{l.giveThankYou}</h3>
                  <p className="text-white/80 text-sm">
                    {l.giveThankYouDesc}
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
