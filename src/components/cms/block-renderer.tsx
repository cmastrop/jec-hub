"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Users, Heart, Star, Music } from "lucide-react";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";
import type { PageBlock } from "@/lib/types/cms";
import type { Lang } from "@/lib/iglesia/types";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };
const FEATURE_ICONS = [BookOpen, Users, Heart, Star, Music];

type Content = Record<string, unknown>;

function str(c: Content, key: string): string {
  const v = c[key];
  return typeof v === "string" ? v : "";
}

function items(c: Content, key: string): { title: string; desc: string }[] {
  const v = c[key];
  if (!Array.isArray(v)) return [];
  return v
    .filter((it) => it && typeof it === "object")
    .map((it) => ({
      title: typeof it.title === "string" ? it.title : "",
      desc: typeof it.desc === "string" ? it.desc : "",
    }));
}

function images(c: Content): string[] {
  const v = c["images"];
  if (!Array.isArray(v)) return [];
  return v.filter((s): s is string => typeof s === "string" && s.length > 0);
}

/** Renderiza un bloque del CMS con el diseno de la pagina iglesia. */
export function BlockRenderer({ block, lang }: { block: PageBlock; lang: Lang }) {
  const c: Content = (lang === "en" ? block.content_en : block.content_es) ?? {};

  switch (block.block_type) {
    case "hero":
      return (
        <PageHero
          image={str(c, "image") || "/iglesia/hero-service.jpg"}
          label={str(c, "label")}
          title={str(c, "title")}
          titleAccent={str(c, "titleAccent") || undefined}
        />
      );

    case "text":
      return (
        <section className="py-16 md:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              {str(c, "title") && (
                <h2 className="text-3xl sm:text-4xl text-[#4A3F35] mb-6 text-center" style={serif}>
                  {str(c, "title")}
                </h2>
              )}
              <p className="text-[#6B5D4D] text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {str(c, "body")}
              </p>
            </FadeIn>
          </div>
        </section>
      );

    case "image":
      return (
        <section className="py-12 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <FadeIn variant="scale-in">
              <div className="overflow-hidden rounded-xl shadow-xl">
                <img
                  src={str(c, "image")}
                  alt={str(c, "caption") || ""}
                  className="w-full object-cover"
                />
              </div>
              {str(c, "caption") && (
                <p className="text-center text-sm text-[#6B5D4D] mt-4 italic">
                  {str(c, "caption")}
                </p>
              )}
            </FadeIn>
          </div>
        </section>
      );

    case "gallery": {
      const imgs = images(c);
      if (imgs.length === 0) return null;
      return (
        <section className="py-16 px-4 sm:px-6 bg-[#FAF8F5]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imgs.map((src, i) => (
                <FadeIn key={`${src}-${i}`} delay={i * 100} variant="scale-in">
                  <div className="overflow-hidden rounded-xl shadow-lg">
                    <img
                      src={src}
                      alt=""
                      className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "verse":
      return (
        <section className="py-16 md:py-24 px-4 sm:px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p
                className="text-xl md:text-2xl font-light text-[#4A3F35] italic leading-relaxed"
                style={serif}
              >
                {str(c, "text")}
              </p>
              {str(c, "reference") && (
                <p className="text-[#C9A86C] font-semibold mt-4">{str(c, "reference")}</p>
              )}
              <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mt-6" />
            </FadeIn>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="py-24 px-4 sm:px-6 bg-[#4A3F35]">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              {str(c, "label") && (
                <p className="text-[#C9A86C] font-medium tracking-[0.2em] uppercase text-sm mb-4">
                  {str(c, "label")}
                </p>
              )}
              <h2 className="text-4xl font-light text-white mb-6" style={serif}>
                {str(c, "title")}
              </h2>
              {str(c, "description") && (
                <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                  {str(c, "description")}
                </p>
              )}
              {str(c, "buttonText") && (
                <Link
                  href={str(c, "buttonLink") || "/iglesia/contacto"}
                  className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white font-semibold px-8 py-4 text-lg rounded-full transition-colors shadow-lg"
                >
                  {str(c, "buttonText")}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </FadeIn>
          </div>
        </section>
      );

    case "video": {
      const id = str(c, "id");
      if (!id) return null;
      const isSpotify = str(c, "provider") === "spotify";
      return (
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <FadeIn variant="scale-in">
              {str(c, "title") && (
                <h2 className="text-2xl sm:text-3xl text-[#4A3F35] mb-6 text-center" style={serif}>
                  {str(c, "title")}
                </h2>
              )}
              {isSpotify ? (
                <iframe
                  src={`https://open.spotify.com/embed/episode/${id}`}
                  className="w-full rounded-xl shadow-lg"
                  height="232"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                />
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    title={str(c, "title") || "Video"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </FadeIn>
          </div>
        </section>
      );
    }

    case "features": {
      const feats = items(c, "items");
      return (
        <section className="py-24 md:py-32 bg-[#FAF8F5]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16">
              {str(c, "label") && (
                <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
                  {str(c, "label")}
                </p>
              )}
              <h2 className="text-3xl sm:text-4xl text-[#4A3F35] mb-4" style={serif}>
                {str(c, "title")}
              </h2>
              <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto" />
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8">
              {feats.map((f, i) => {
                const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                return (
                  <FadeIn key={`${f.title}-${i}`} delay={i * 150} variant="fade-up">
                    <div className="bg-white rounded-xl p-8 sm:p-10 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C9A86C]/10 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-[#C9A86C]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#4A3F35] mb-3" style={serif}>
                        {f.title}
                      </h3>
                      <p className="text-[#6B5D4D] leading-relaxed text-sm">{f.desc}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    case "leader":
      return (
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <FadeIn variant="fade-right" className="relative">
                <div className="overflow-hidden rounded-xl shadow-xl">
                  <img
                    src={str(c, "image")}
                    alt={str(c, "name")}
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>
                {str(c, "badge") && (
                  <div className="absolute -bottom-6 -right-6 bg-[#C9A86C] text-white p-6 rounded-lg hidden md:block shadow-lg">
                    <p className="text-xl font-semibold" style={serif}>
                      {str(c, "badge")}
                    </p>
                  </div>
                )}
              </FadeIn>
              <FadeIn delay={200} variant="fade-left">
                <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
                  {lang === "en" ? "Meet the Leader" : "Conoce al Líder"}
                </p>
                <h2 className="text-3xl sm:text-4xl text-[#4A3F35] mb-2" style={serif}>
                  <span className="font-bold text-[#C9A86C]">{str(c, "name")}</span>
                </h2>
                {str(c, "role") && (
                  <p className="text-[#6B5D4D] text-sm mb-6">{str(c, "role")}</p>
                )}
                <div className="w-16 h-0.5 bg-[#C9A86C] mb-8" />
                <p className="text-[#6B5D4D] text-lg leading-relaxed whitespace-pre-line">
                  {str(c, "bio")}
                </p>
              </FadeIn>
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}
