"use client";

import { Play, User, Calendar, Clock } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function SermonesPage() {
  const { lang } = useLang();
  const l = translations[lang];

  const sermons = [
    {
      title: l.sermon1Title,
      desc: l.sermon1Desc,
      series: l.sermon1Series,
      speaker: l.sermonsPastorMorris,
      date: "Feb 16, 2025",
      duration: "42 min",
      image: "/iglesia/preaching.jpg",
    },
    {
      title: l.sermon2Title,
      desc: l.sermon2Desc,
      series: l.sermon2Series,
      speaker: l.sermonsPastorMorris,
      date: "Feb 9, 2025",
      duration: "38 min",
      image: "/iglesia/speaker.jpg",
    },
    {
      title: l.sermon3Title,
      desc: l.sermon3Desc,
      series: l.sermon3Series,
      speaker: l.sermonsPastorMorris,
      date: "Feb 2, 2025",
      duration: "45 min",
      image: "/iglesia/worship.jpg",
    },
    {
      title: l.sermon4Title,
      desc: l.sermon4Desc,
      series: l.sermon4Series,
      speaker: l.sermonsPastorMorris,
      date: "Jan 26, 2025",
      duration: "40 min",
      image: "/iglesia/hero-service.jpg",
    },
    {
      title: l.sermon5Title,
      desc: l.sermon5Desc,
      series: l.sermon5Series,
      speaker: l.sermonsPastorMorris,
      date: "Jan 19, 2025",
      duration: "36 min",
      image: "/iglesia/musicians.jpg",
    },
    {
      title: l.sermon6Title,
      desc: l.sermon6Desc,
      series: l.sermon6Series,
      speaker: l.sermonsPastorMorris,
      date: "Jan 12, 2025",
      duration: "44 min",
      image: "/iglesia/worship.jpg",
    },
  ];

  const featured = sermons[0];
  const rest = sermons.slice(1);

  return (
    <>
      <PageHero
        image="/iglesia/preaching.jpg"
        label={l.sermonsLabel}
        title={l.sermonsTitle1}
        titleAccent={l.sermonsTitle2}
        allowOverlap
      />

      {/* ═══ Featured Sermon (overlapping hero) ═══ */}
      <section className="py-16 px-4 sm:px-6 -mt-12 sm:-mt-16 lg:-mt-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2">
                {/* Image with play button */}
                <div className="aspect-video lg:aspect-auto relative">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button className="w-20 h-20 rounded-full bg-white/90 hover:bg-white text-[#4A3F35] shadow-lg flex items-center justify-center transition-colors">
                      <Play className="w-10 h-10 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <span className="inline-block w-fit bg-[#C9A86C]/20 text-[#C9A86C] text-xs font-semibold px-2.5 py-0.5 rounded-md mb-4">
                    {l.sermonsFeaturedLabel}
                  </span>
                  <h2
                    className="text-2xl md:text-3xl font-semibold text-[#4A3F35] mb-4"
                    style={serif}
                  >
                    {featured.title}
                  </h2>
                  <p className="text-[#6B5D4D] mb-6">{featured.desc}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-[#6B5D4D] mb-6">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featured.speaker}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {featured.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featured.duration}
                    </span>
                  </div>
                  <button className="w-fit bg-[#4A3F35] hover:bg-[#3a3128] text-white rounded-full px-8 py-2.5 text-sm font-medium transition-colors">
                    {l.sermonsWatchOnYouTube}
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Sermon Grid ═══ */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((sermon, i) => (
              <FadeIn key={i} delay={i * 120} variant="fade-up">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col">
                  {/* Image with hover play */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={sermon.image}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-[#4A3F35] shadow-lg flex items-center justify-center">
                        <Play className="w-6 h-6 ml-0.5" />
                      </button>
                    </div>
                    {/* Series badge */}
                    <span className="absolute top-4 left-4 bg-[#4A3F35] text-white text-xs font-semibold px-2.5 py-0.5 rounded-md shadow">
                      {sermon.series}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-[#4A3F35] mb-2 group-hover:text-[#C9A86C] transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>
                    <p className="text-[#6B5D4D] text-sm mb-4 line-clamp-2 flex-1">
                      {sermon.desc}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-[#6B5D4D]">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {sermon.speaker.split(" ").slice(0, 2).join(" ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sermon.duration}
                      </span>
                    </div>
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
