"use client";

import { Play, User, Calendar, ExternalLink, Headphones, Music } from "lucide-react";
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
    },
    {
      title: l.sermon2Title,
      desc: l.sermon2Desc,
      series: l.sermon2Series,
      speaker: l.sermonsPastorMorris,
      date: lang === "en" ? "Sep 6, 2017" : "6 Sep 2017",
      youtubeId: "reTiSkwk_oU",
    },
    {
      title: l.sermon3Title,
      desc: l.sermon3Desc,
      series: l.sermon3Series,
      speaker: l.sermonsPastorMorris,
      date: "",
      youtubeId: "zD_bPrkJ2uo",
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
      spotifyId: "7lFVsoyWzYkwyockTb6lxK",
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
                {/* YouTube Thumbnail with play button */}
                <a
                  href={`https://www.youtube.com/watch?v=${featured.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video lg:aspect-auto relative block group/thumb"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${featured.youtubeId}/maxresdefault.jpg`}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/90 group-hover/thumb:bg-white group-hover/thumb:scale-110 text-[#4A3F35] shadow-lg flex items-center justify-center transition-all duration-300">
                      <Play className="w-10 h-10 ml-1" />
                    </div>
                  </div>
                </a>

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
                    {featured.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featured.date}
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${featured.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-fit bg-[#4A3F35] hover:bg-[#3a3128] text-white rounded-full px-8 py-2.5 text-sm font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {l.sermonsWatchOnYouTube}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
                <a
                  href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col"
                >
                  {/* YouTube Thumbnail with hover play */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={`https://i.ytimg.com/vi/${sermon.youtubeId}/hqdefault.jpg`}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-[#4A3F35] shadow-lg flex items-center justify-center">
                        <Play className="w-6 h-6 ml-0.5" />
                      </div>
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
                      {sermon.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {sermon.date}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
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
                <a
                  href={`https://open.spotify.com/episode/${podcast.spotifyId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col"
                >
                  {/* Spotify visual header */}
                  <div className="bg-gradient-to-br from-[#1DB954] to-[#158a3e] p-6 flex items-center justify-between">
                    <div>
                      <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {podcast.series}
                      </span>
                    </div>
                    <Headphones className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-[#4A3F35] mb-2 group-hover:text-[#1DB954] transition-colors">
                      {podcast.title}
                    </h3>
                    <p className="text-[#6B5D4D] text-sm mb-4 flex-1">
                      {podcast.desc}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#6B5D4D]">
                      <div className="flex gap-3">
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
                      <span className="text-[#1DB954] font-semibold group-hover:underline">
                        {l.sermonsListenNow} →
                      </span>
                    </div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
