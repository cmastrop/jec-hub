"use client";

import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function MinisteriosPage() {
  const { lang } = useLang();
  const l = translations[lang];

  const ministries = [
    { title: l.mensTitle, desc: l.mensDesc, img: "/iglesia/mens-group.jpg" },
    { title: l.womensTitle, desc: l.womensDesc, img: "/iglesia/womens-group.jpg" },
    { title: l.youthTitle, subtitle: "Zoe Zone", desc: l.youthDesc, img: "/iglesia/youth.jpg" },
    { title: l.sundaySchoolTitle, desc: l.sundaySchoolDesc, img: "/iglesia/children.jpg" },
  ];

  return (
    <>
      <PageHero
        image="/iglesia/musicians.jpg"
        label={l.ministriesLabel}
        title={l.ministriesTitle}
      />

      <section className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-[#6B5D4D] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              {l.ministriesHeroDesc}
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {ministries.map((ministry, i) => (
              <FadeIn key={ministry.title} delay={i * 100} variant={i % 2 === 0 ? "fade-right" : "fade-left"}>
                <div className="group relative overflow-hidden h-80 sm:h-96 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
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
        </div>
      </section>
    </>
  );
}
