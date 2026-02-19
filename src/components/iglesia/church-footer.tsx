"use client";

import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export function ChurchFooter() {
  const { lang } = useLang();
  const l = translations[lang];

  return (
    <footer className="bg-[#3a3128] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5">
          <img
            src="/iglesia/logo.png"
            alt={l.churchName}
            className="w-14 h-14 rounded-full opacity-80"
          />
          <p
            className="text-white/50 text-sm text-center tracking-wide"
            style={serif}
          >
            {l.footerChurch}
          </p>
          <p className="text-[#C9A86C]/60 text-xs tracking-[0.2em] uppercase">
            Est. 1990 &middot; Perth, Australia
          </p>
          <div className="w-12 h-px bg-[#C9A86C]/20 my-2" />
          <a
            href="https://hub.jesuseselcamino.com.au"
            className="text-white/30 hover:text-[#C9A86C]/60 transition-colors text-xs tracking-wide"
          >
            {l.footerPlatform} &rarr;
          </a>
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Jesus es el Camino inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
