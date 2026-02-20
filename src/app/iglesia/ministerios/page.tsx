"use client";

import Link from "next/link";
import { Users, Clock, User, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function MinisteriosPage() {
  const { lang } = useLang();
  const l = translations[lang];

  const ministries = [
    {
      title: l.mensTitle,
      desc: l.mensDescLong,
      category: l.mensCategory,
      schedule: l.mensSchedule,
      leader: l.mensLeader,
      img: "/iglesia/mens-group.jpg",
    },
    {
      title: l.womensTitle,
      desc: l.womensDescLong,
      category: l.womensCategory,
      schedule: l.womensSchedule,
      leader: l.womensLeader,
      img: "/iglesia/womens-group.jpg",
    },
    {
      title: l.youthTitle,
      subtitle: "Zoe Zone",
      desc: l.youthDescLong,
      category: l.youthCategory,
      schedule: l.youthSchedule,
      leader: l.youthLeader,
      img: "/iglesia/youth.jpg",
    },
    {
      title: l.sundaySchoolTitle,
      desc: l.sundaySchoolDescLong,
      category: l.sundaySchoolCategory,
      schedule: l.sundaySchoolSchedule,
      leader: l.sundaySchoolLeader,
      img: "/iglesia/children.jpg",
    },
    {
      title: l.worshipTitle,
      desc: l.worshipDescLong,
      category: l.worshipCategory,
      schedule: l.worshipSchedule,
      leader: l.worshipLeader,
      img: "/iglesia/worship-team.jpg",
    },
  ];

  return (
    <>
      <PageHero
        image="/iglesia/congregation.jpg"
        label={l.ministriesLabel}
        title={l.ministriesTitle1}
        titleAccent={l.ministriesTitle2}
        allowOverlap
      />

      {/* ═══ Scripture Intro (overlapping hero) ═══ */}
      <section className="py-16 px-4 sm:px-6 -mt-12 sm:-mt-16 lg:-mt-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-12 text-center">
              <p
                className="text-xl md:text-2xl font-light text-[#4A3F35] italic leading-relaxed"
                style={serif}
              >
                {l.ministriesVerse}
              </p>
              <p className="text-[#C9A86C] font-semibold mt-4">
                {l.ministriesVerseRef}
              </p>
              <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto my-6" />
              <p className="text-[#6B5D4D] text-base sm:text-lg leading-relaxed">
                {l.ministriesIntroDesc}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Ministry Cards Grid ═══ */}
      <section className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8 lg:gap-10">
            {ministries.map((ministry, i) => (
              <FadeIn
                key={ministry.title}
                delay={i * 150}
                variant={i % 2 === 0 ? "fade-right" : "fade-left"}
                className={i === ministries.length - 1 && ministries.length % 2 !== 0 ? "sm:col-span-2 sm:max-w-lg sm:mx-auto" : ""}
              >
                <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group h-full flex flex-col">
                  {/* Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={ministry.img}
                      alt={ministry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {/* Category badge */}
                    <span className="absolute top-4 left-4 bg-[#C9A86C]/20 backdrop-blur-sm text-[#C9A86C] text-xs font-semibold px-3 py-1 rounded-full">
                      {ministry.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <h3
                      className="text-xl sm:text-2xl font-semibold text-[#4A3F35] mb-1"
                      style={serif}
                    >
                      {ministry.title}
                    </h3>
                    {ministry.subtitle && (
                      <p className="text-[#C9A86C] text-sm italic mb-3">
                        {ministry.subtitle}
                      </p>
                    )}
                    {!ministry.subtitle && <div className="mb-3" />}

                    <p className="text-[#6B5D4D] leading-relaxed text-sm flex-1">
                      {ministry.desc}
                    </p>

                    {/* Schedule & Leader */}
                    <div className="flex flex-wrap gap-4 text-sm text-[#6B5D4D] mt-6 pt-4 border-t border-[#E8E0D5]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#C9A86C]" />
                        {ministry.schedule}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#C9A86C]" />
                        {ministry.leader}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href="/iglesia/contacto"
                      className="inline-flex items-center gap-2 mt-6 w-fit bg-[#4A3F35] hover:bg-[#3a3128] text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors group/btn"
                    >
                      {l.ministriesLearnMore}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Meet Our Leaders ═══ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
              {l.ministriesLeadersLabel}
            </p>
            <h2
              className="text-3xl sm:text-4xl text-[#4A3F35] mb-4"
              style={serif}
            >
              <span className="font-light">{l.ministriesLeadersTitle1} </span>
              <span className="font-bold">{l.ministriesLeadersTitle2}</span>
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mb-6" />
            <p className="text-[#6B5D4D] text-base sm:text-lg max-w-2xl mx-auto">
              {l.ministriesLeadersDesc}
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              {
                name: l.mensLeader,
                role: l.mensTitle,
                img: "/iglesia/leaders/morris.jpeg",
              },
              {
                name: l.womensLeader,
                role: l.womensTitle,
                img: "/iglesia/leaders/daisy.jpeg",
              },
              {
                name: l.youthLeader,
                role: l.youthTitle,
                img: "/iglesia/leaders/raquel.jpg",
              },
              {
                name: l.sundaySchoolLeader,
                role: l.sundaySchoolTitle,
                img: "/iglesia/leaders/clara.jpeg",
              },
            ].map((leader, i) => (
              <FadeIn key={leader.name} delay={i * 150} variant="fade-up">
                <div className="text-center group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-lg ring-4 ring-white group-hover:ring-[#C9A86C]/30 transition-all duration-500">
                    <img
                      src={leader.img}
                      alt={leader.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h3
                    className="text-lg font-semibold text-[#4A3F35]"
                    style={serif}
                  >
                    {leader.name}
                  </h3>
                  <p className="text-[#C9A86C] text-sm font-medium mt-1">
                    {leader.role}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ One Body, Many Parts (dark parallax section) ═══ */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <img
          src="/iglesia/worship.jpg"
          alt="Worship"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-[#2a1f14]/85" />

        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#C9A86C] rounded-full opacity-5" />
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-white rounded-full opacity-5" />

        <FadeIn className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-6">
            {l.ministriesOneBodyLabel}
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight"
            style={serif}
          >
            <span className="font-light">{l.ministriesOneBodyTitle1}</span>{" "}
            <span className="text-[#C9A86C] font-bold">
              {l.ministriesOneBodyTitle2}
            </span>
          </h2>
          <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto my-8" />
          <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {l.ministriesOneBodyDesc}
          </p>
        </FadeIn>
      </section>

      {/* ═══ CTA: Find Your Place ═══ */}
      <section className="py-24 px-4 sm:px-6 bg-[#4A3F35]">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-[#C9A86C] font-medium tracking-[0.2em] uppercase text-sm mb-4">
              {l.ministriesCTALabel}
            </p>
            <h2
              className="text-4xl font-light text-white mb-6"
              style={serif}
            >
              {l.ministriesCTATitle1}{" "}
              <span className="font-semibold">{l.ministriesCTATitle2}</span>
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              {l.ministriesCTADesc}
            </p>
            <Link
              href="/iglesia/contacto"
              className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white font-semibold px-8 py-4 text-lg rounded-full transition-colors shadow-lg"
            >
              <Users className="w-5 h-5" />
              {l.ministriesCTAButton}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
