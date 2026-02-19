"use client";

import Link from "next/link";
import { Quote, Plus, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function TestimoniosPage() {
  const { lang } = useLang();
  const l = translations[lang];

  const testimonies = [
    {
      category: lang === "en" ? "Family Restored" : "Familia Restaurada",
      name: l.testimony1Name,
      quote: l.testimony1Quote,
      image: "/iglesia/worship.jpg",
    },
    {
      category: lang === "en" ? "Finding Community" : "Encontrando Comunidad",
      name: l.testimony2Name,
      quote: l.testimony2Quote,
      image: "/iglesia/youth.jpg",
    },
    {
      category: lang === "en" ? "Pastoral Care" : "Cuidado Pastoral",
      name: l.testimony3Name,
      quote: l.testimony3Quote,
      image: "/iglesia/preaching.jpg",
    },
    {
      category: lang === "en" ? "New Beginnings" : "Nuevos Comienzos",
      name: l.testimony4Name,
      quote: l.testimony4Quote,
      image: "/iglesia/hero-service.jpg",
    },
    {
      category: lang === "en" ? "Brotherhood" : "Hermandad",
      name: l.testimony5Name,
      quote: l.testimony5Quote,
      image: "/iglesia/mens-group.jpg",
    },
    {
      category: lang === "en" ? "Next Generation" : "Próxima Generación",
      name: l.testimony6Name,
      quote: l.testimony6Quote,
      image: "/iglesia/children.jpg",
    },
  ];

  return (
    <>
      <PageHero
        image="/iglesia/hero-service.jpg"
        label={l.testimoniesPageLabel}
        title={l.testimoniesPageTitle1}
        titleAccent={l.testimoniesPageTitle2}
      />

      {/* ═══ Intro with Quote ═══ */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <Quote className="w-12 h-12 text-[#C9A86C] mx-auto mb-6" />
            <p className="text-xl text-[#6B5D4D] leading-relaxed mb-6">
              {l.testimoniesPageDesc}
            </p>
            <Link
              href="/iglesia/contacto"
              className="inline-flex items-center gap-2 bg-[#4A3F35] hover:bg-[#3a3128] text-white rounded-full px-8 py-3 text-sm font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              {l.shareTestimonyButton}
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Testimonies Grid with Photos ═══ */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonies.map((t, i) => (
              <FadeIn key={i} delay={i * 120} variant="fade-up">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden h-full flex flex-col">
                  {/* Photo */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-[#C9A86C] text-sm font-semibold uppercase tracking-wider">
                      {t.category}
                    </span>
                    <h3
                      className="text-xl font-semibold text-[#4A3F35] mt-2 mb-3"
                      style={serif}
                    >
                      {t.name}
                    </h3>
                    <p className="text-[#6B5D4D] line-clamp-3 flex-1">
                      {t.quote}
                    </p>
                    <p className="text-[#4A3F35] font-medium mt-4 group-hover:text-[#C9A86C] transition-colors">
                      {lang === "en" ? "Read More" : "Leer Más"} →
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA: Your Story Matters ═══ */}
      <section className="py-24 px-4 sm:px-6 bg-[#4A3F35]">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-[#C9A86C] font-medium tracking-[0.2em] uppercase text-sm mb-4">
              {lang === "en" ? "Your Story Matters" : "Tu Historia Importa"}
            </p>
            <h2
              className="text-4xl font-light text-white mb-6"
              style={serif}
            >
              {lang === "en" ? "What's Your " : "¿Cuál Es Tu "}
              <span className="font-semibold">
                {lang === "en" ? "Testimony?" : "Testimonio?"}
              </span>
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              {l.shareTestimonyDesc}
            </p>
            <Link
              href="/iglesia/contacto"
              className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white font-semibold px-8 py-4 text-lg rounded-full transition-colors shadow-lg"
            >
              {l.shareTestimonyButton}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
