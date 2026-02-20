"use client";

import Link from "next/link";
import { Radio, Clock, MapPin, Bell, ExternalLink, Play } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };
const YOUTUBE_CHANNEL = "iglesiacristianajesuseselc6023";
const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/@${YOUTUBE_CHANNEL}`;

export default function EnVivoPage() {
  const { lang } = useLang();
  const l = translations[lang];

  return (
    <>
      <PageHero
        image="/iglesia/worship.jpg"
        label={l.liveLabel}
        title={l.liveTitle1}
        titleAccent={l.liveTitle2}
        allowOverlap
      />

      {/* ═══ Live Player (overlapping hero) ═══ */}
      <section className="py-16 px-4 sm:px-6 -mt-12 sm:-mt-16 lg:-mt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* YouTube Embed */}
              <div className="aspect-video relative bg-[#1a1510]">
                <iframe
                  src={`https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL}&autoplay=0`}
                  title="Live Stream"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Fallback overlay when not live — hidden when iframe loads live */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a1f14] to-[#1a1510] flex flex-col items-center justify-center text-center px-6 pointer-events-none opacity-0 peer-empty:opacity-100">
                  <Radio className="w-16 h-16 text-[#C9A86C] mb-4" />
                  <p className="text-white text-lg mb-2" style={serif}>
                    {l.liveNotLive}
                  </p>
                </div>
              </div>

              {/* Info bar below player */}
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FAF8F5]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-[#4A3F35] font-semibold" style={serif}>
                    {l.liveSundayTitle}
                  </p>
                  <span className="text-[#6B5D4D] text-sm">
                    {l.liveSundayTime}
                  </span>
                </div>
                <a
                  href={`${YOUTUBE_CHANNEL_URL}/live`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#cc0000] text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {l.liveWatchButton}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ Service Schedule ═══ */}
      <section className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
              {l.liveWhenLabel}
            </p>
            <h2
              className="text-3xl sm:text-4xl text-[#4A3F35] mb-4"
              style={serif}
            >
              <span className="font-light">{l.servicesTitle1} </span>
              <span className="font-bold">{l.servicesTitle2}</span>
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto" />
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <FadeIn variant="fade-right">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#C9A86C]/20 rounded-full flex items-center justify-center">
                  <Clock className="w-7 h-7 text-[#C9A86C]" />
                </div>
                <h3
                  className="text-xl font-semibold text-[#4A3F35] mb-2"
                  style={serif}
                >
                  {l.sundayTitle}
                </h3>
                <p className="text-[#C9A86C] font-semibold text-lg mb-2">
                  {lang === "en" ? "Sunday" : "Domingo"} 3:00 PM — 5:00 PM
                </p>
                <p className="text-[#6B5D4D] text-sm">{l.sundayDesc}</p>
              </div>
            </FadeIn>

            <FadeIn variant="fade-left" delay={150}>
              <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#C9A86C]/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-[#C9A86C]" />
                </div>
                <h3
                  className="text-xl font-semibold text-[#4A3F35] mb-2"
                  style={serif}
                >
                  {lang === "en" ? "Visit In Person" : "Visítanos en Persona"}
                </h3>
                <p className="text-[#C9A86C] font-semibold text-lg mb-2">
                  73 Nollamara Ave
                </p>
                <p className="text-[#6B5D4D] text-sm">
                  Nollamara WA 6061, Australia
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ Subscribe CTA ═══ */}
      <section className="py-24 px-4 sm:px-6 bg-[#4A3F35]">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-[#C9A86C]" />
            </div>
            <h2
              className="text-4xl font-light text-white mb-6"
              style={serif}
            >
              {lang === "en" ? "Never Miss a " : "No Te Pierdas Ningún "}
              <span className="font-semibold">
                {lang === "en" ? "Service" : "Servicio"}
              </span>
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              {l.liveSubscribe}
            </p>
            <a
              href={`${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#cc0000] text-white font-semibold px-8 py-4 text-lg rounded-full transition-colors shadow-lg"
            >
              <Play className="w-5 h-5" />
              {l.liveSubscribeButton}
              <ExternalLink className="w-4 h-4" />
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
