"use client";

import Link from "next/link";
import { User, Calendar, Music, FileText } from "lucide-react";
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
      date: lang === "en" ? "Sep 21, 2025" : "21 Sep 2025",
      youtubeId: "UYkCTuR5aBQ",
      slug: "la-epoca-dorada-del-matrimonio",
    },
    {
      title: l.sermon2Title,
      desc: l.sermon2Desc,
      series: l.sermon2Series,
      speaker: l.sermonsPastorMorris,
      date: lang === "en" ? "Sep 6, 2017" : "6 Sep 2017",
      youtubeId: "reTiSkwk_oU",
      slug: "el-don-de-la-sabiduria",
    },
    {
      title: l.sermon3Title,
      desc: l.sermon3Desc,
      series: l.sermon3Series,
      speaker: l.sermonsPastorMorris,
      date: "",
      youtubeId: "zD_bPrkJ2uo",
      slug: "el-arbol-de-la-vida",
    },
  ];

  const podcasts = [
    {
      title: l.spotify1Title,
      desc: l.spotify1Desc,
      series: l.spotify1Series,
      duration: "12 min",
      date: lang === "en" ? "Feb 2022" : "Feb 2022",
      spotifyId: "36uYNNzcciNCQCqTS1us5O",
    },
    {
      title: l.spotify2Title,
      desc: l.spotify2Desc,
      series: l.spotify2Series,
      duration: "43 min",
      date: lang === "en" ? "Aug 2021" : "Ago 2021",
      spotifyId: "1RXaXy1GIwYVOnXM6IS5fI",
    },
    {
      title: l.spotify3Title,
      desc: l.spotify3Desc,
      series: l.spotify3Series,
      duration: "8 min",
      date: lang === "en" ? "Feb 2021" : "Feb 2021",
      spotifyId: "6i2ohIqvduXIYPjOzDludV",
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
                {/* Embedded YouTube Player */}
                <div className="aspect-video lg:aspect-auto lg:min-h-[360px] relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${featured.youtubeId}`}
                    title={featured.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
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
                  <div className="flex flex-wrap gap-4 text-sm text-[#6B5D4D] mb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featured.speaker}
                    </span>
                    {featured.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featured.date}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/iglesia/sermones/${featured.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A86C] hover:text-[#4A3F35] transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {lang === "en" ? "Read Sermon Notes" : "Leer Notas del Sermon"}
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Sermon Grid ═══ */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {rest.map((sermon, i) => (
              <FadeIn key={sermon.youtubeId} delay={i * 150} variant="fade-up">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Embedded YouTube Player */}
                  <div className="aspect-video relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${sermon.youtubeId}`}
                      title={sermon.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="inline-block w-fit bg-[#4A3F35] text-white text-xs font-semibold px-2.5 py-0.5 rounded-md mb-3">
                      {sermon.series}
                    </span>
                    <h3 className="text-lg font-semibold text-[#4A3F35] mb-2 line-clamp-2">
                      {sermon.title}
                    </h3>
                    <p className="text-[#6B5D4D] text-sm mb-4 line-clamp-2 flex-1">
                      {sermon.desc}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B5D4D]">
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {sermon.speaker.split(" ").slice(0, 2).join(" ")}
                        </span>
                        {sermon.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {sermon.date}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/iglesia/sermones/${sermon.slug}`}
                        className="flex items-center gap-1 font-semibold text-[#C9A86C] hover:text-[#4A3F35] transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        {lang === "en" ? "Notes" : "Notas"}
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Spotify Podcast Section ═══ */}
      <section className="py-24 px-4 sm:px-6 bg-[#1DB954]/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-[#1DB954] tracking-[0.3em] text-xs uppercase mb-4">
              {l.sermonsSpotifyLabel}
            </p>
            <h2
              className="text-3xl sm:text-4xl text-[#4A3F35] mb-4"
              style={serif}
            >
              <span className="font-light">{l.sermonsSpotifyTitle1} </span>
              <span className="font-bold">{l.sermonsSpotifyTitle2}</span>
            </h2>
            <div className="w-16 h-0.5 bg-[#1DB954] mx-auto mb-6" />
            <p className="text-[#6B5D4D] text-base sm:text-lg max-w-2xl mx-auto">
              {l.sermonsSpotifyDesc}
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {podcasts.map((podcast, i) => (
              <FadeIn key={podcast.spotifyId} delay={i * 150} variant="fade-up">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Embedded Spotify Player */}
                  <div className="w-full">
                    <iframe
                      src={`https://open.spotify.com/embed/episode/${podcast.spotifyId}?utm_source=generator&theme=0`}
                      title={podcast.title}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="w-full rounded-t-xl"
                      height="352"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-[#4A3F35] mb-2">
                      {podcast.title}
                    </h3>
                    <p className="text-[#6B5D4D] text-sm mb-4 flex-1">
                      {podcast.desc}
                    </p>
                    <div className="flex gap-3 text-xs text-[#6B5D4D]">
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        {podcast.duration}
                      </span>
                      {podcast.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {podcast.date}
                        </span>
                      )}
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
