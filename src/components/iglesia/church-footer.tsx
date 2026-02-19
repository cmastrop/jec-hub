"use client";

import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export function ChurchFooter() {
  const { lang } = useLang();
  const l = translations[lang];

  const navItems = [
    { label: l.navHome, href: "/iglesia" },
    { label: l.navAbout, href: "/iglesia/nosotros" },
    { label: l.navMinistries, href: "/iglesia/ministerios" },
    { label: l.navEvents, href: "/iglesia/eventos" },
    { label: l.navContact, href: "/iglesia/contacto" },
  ];

  return (
    <footer className="bg-[#3a3128] pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/iglesia/logo.png"
                alt={l.churchName}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-white text-sm" style={serif}>
                {l.churchName}
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {l.footerAboutDesc}
            </p>
            {/* Social icons */}
            <p className="text-white/30 text-xs uppercase tracking-wider mb-3">
              {l.footerFollowUs}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/JesusEsElCaminoPerthAustralia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#C9A86C] rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/jesuseselcamino_au/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#C9A86C] rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@jesuseselcaminoperth"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#C9A86C] rounded-full flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-[#C9A86C] text-sm font-semibold tracking-wider uppercase mb-5">
              {l.footerQuickLinks}
            </h4>
            <nav className="space-y-2.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-white/50 hover:text-[#C9A86C] text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Service Times */}
          <div>
            <h4 className="text-[#C9A86C] text-sm font-semibold tracking-wider uppercase mb-5">
              {l.footerServiceTimes}
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-white text-sm font-medium">{l.sundayTitle}</p>
                <p className="text-white/50 text-sm">{l.footerSundayTime}</p>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{l.wednesdayTitle}</p>
                <p className="text-white/50 text-sm">{l.footerWednesdayTime}</p>
              </div>
            </div>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h4 className="text-[#C9A86C] text-sm font-semibold tracking-wider uppercase mb-5">
              {l.footerConnect}
            </h4>
            <div className="space-y-3">
              <p className="text-white/50 text-sm flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C9A86C] mt-0.5 flex-shrink-0" />
                73 Nollamara Ave, Nollamara WA 6061
              </p>
              <a
                href="mailto:hola@jesuseselcamino.com.au"
                className="text-white/50 text-sm hover:text-[#C9A86C] flex items-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4 text-[#C9A86C] flex-shrink-0" />
                hola@jesuseselcamino.com.au
              </a>
              <a
                href="tel:0433370537"
                className="text-white/50 text-sm hover:text-[#C9A86C] flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C9A86C] flex-shrink-0" />
                0433 370 537
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Jesus es el Camino inc. All rights reserved.
          </p>
          <a
            href="https://hub.jesuseselcamino.com.au"
            className="text-white/30 hover:text-[#C9A86C]/60 transition-colors text-xs tracking-wide"
          >
            {l.footerPlatform} &rarr;
          </a>
        </div>
      </div>
    </footer>
  );
}
