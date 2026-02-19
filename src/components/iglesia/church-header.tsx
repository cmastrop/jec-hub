"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

const navItems = [
  { key: "navHome", href: "/iglesia" },
  { key: "navAbout", href: "/iglesia/nosotros" },
  { key: "navMinistries", href: "/iglesia/ministerios" },
  { key: "navEvents", href: "/iglesia/eventos" },
  { key: "navContact", href: "/iglesia/contacto" },
] as const;

export function ChurchHeader() {
  const { lang, toggleLang } = useLang();
  const pathname = usePathname();
  const isHomepage = pathname === "/iglesia" || pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const l = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On sub-pages, header is always "scrolled" (opaque)
  const showOpaque = scrolled || !isHomepage;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showOpaque
          ? "bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm border-b border-[#C9A86C]/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] sm:h-[88px]">
          {/* Logo */}
          <Link href="/iglesia" className="flex items-center gap-3">
            <img
              src="/iglesia/logo.png"
              alt="Jesus Es El Camino"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md"
            />
            <span
              className={`text-sm sm:text-base font-medium tracking-wide transition-colors duration-300 ${
                showOpaque ? "text-[#4A3F35]" : "text-white"
              }`}
              style={serif}
            >
              {l.churchName}
            </span>
          </Link>

          {/* Desktop Nav + Lang Toggle */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              {navItems.map((item) => {
                const label = l[item.key as keyof typeof l] as string;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm tracking-wide font-medium transition-colors duration-300 hover:text-[#C9A86C] ${
                      isActive
                        ? "text-[#C9A86C]"
                        : showOpaque
                        ? "text-[#4A3F35]"
                        : "text-white/90"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={toggleLang}
              className={`flex items-center gap-1.5 text-xs font-medium tracking-wide px-3 py-1.5 rounded-full border transition-all duration-300 ${
                showOpaque
                  ? "border-[#C9A86C]/30 text-[#4A3F35] hover:bg-[#C9A86C]/10"
                  : "border-white/30 text-white/90 hover:bg-white/10"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "ES" : "EN"}
            </button>
          </div>

          {/* Mobile: lang toggle + menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLang}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors ${
                showOpaque
                  ? "border-[#C9A86C]/30 text-[#4A3F35]"
                  : "border-white/30 text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "ES" : "EN"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                showOpaque ? "text-[#4A3F35]" : "text-white"
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#4A3F35]/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#FAF8F5] shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-[#4A3F35] hover:text-[#C9A86C]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-3 pb-8">
                  <img
                    src="/iglesia/logo.png"
                    alt="Jesus Es El Camino"
                    className="w-16 h-16 rounded-full shadow-lg"
                  />
                  <span className="text-lg text-[#4A3F35]" style={serif}>
                    {l.churchName}
                  </span>
                </div>
                <nav className="flex-1 px-6 space-y-1">
                  {navItems.map((item) => {
                    const label = l[item.key as keyof typeof l] as string;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium tracking-wide transition-colors ${
                          isActive
                            ? "text-[#C9A86C] bg-[#C9A86C]/5"
                            : "text-[#4A3F35] hover:text-[#C9A86C] hover:bg-[#C9A86C]/5"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t border-[#E8E0D5] px-6 py-6">
                  <p className="text-sm text-[#6B5D4D]">{l.mobileSunday}</p>
                  <p className="text-sm text-[#6B5D4D] mt-1">
                    73 Nollamara Ave, Nollamara WA
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
