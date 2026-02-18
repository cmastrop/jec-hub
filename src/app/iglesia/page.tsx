"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import type { ChurchEvent } from "@/lib/types/database";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sun,
  Moon,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  BookOpen,
  Send,
  Heart,
  Menu,
  X,
  Globe,
  CheckCircle,
  Loader2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

// ─── Translations ─────────────────────────────────────────────
type Lang = "en" | "es";

const t = {
  en: {
    navHome: "Home",
    navServices: "Services",
    navVision: "Vision",
    navMinistries: "Ministries",
    navPastors: "Pastors",
    navContact: "Contact",
    heroLabel: "Welcome to",
    heroSubtitle: "You Are Welcome Here",
    heroDesc1:
      "A multicultural Spanish and English-speaking church that seeks to make faithful followers of Christ",
    heroDesc2:
      "Jesús es el Camino es una iglesia multicultural de habla Hispana e Inglés que busca hacer fieles seguidores de Cristo",
    heroCta: "Join Us This Sunday",
    servicesLabel: "Join Us",
    servicesTitle: "Service Times",
    sundayTitle: "Sunday Service",
    sundayDesc: "Worship, Word & Fellowship",
    wednesdayTitle: "Wednesday Night",
    wednesdayDesc: "Prayer & Bible Study",
    visionLabel: "Nuestra Visión",
    visionTitle: "Our Vision",
    equipTitle: "EQUIP",
    equipDesc:
      "We seek to equip newcomers with the tools to become devoted disciples of Christ, using biblical teachings within the church or through discipleship groups.",
    sendTitle: "SEND",
    sendDesc:
      "Our objective is to send committed followers to society once they have developed the habit and discipline of being faithful and mature disciples of Christ.",
    reachTitle: "REACH",
    reachDesc:
      "Our goal is to reach those people who have not yet embraced the gospel. We aim to achieve this through gospel preachings and acts of love.",
    missionLabel: "Our Mission",
    missionLine1: "Create Disciples",
    missionLine2: "for Christ",
    missionSubtitle: "Hacer Discípulos para Cristo",
    missionDesc1:
      "The mission of the church is to make disciples for Christ, welcoming them into the kingdom and guiding them to embrace and follow Jesus' commandments.",
    missionDesc2:
      "La misión de la iglesia es hacer discípulos para Cristo, dándoles la bienvenida al reino y guiándolos a aceptar y seguir los mandamientos de Jesús.",
    ministriesLabel: "Nuestros Ministerios",
    ministriesTitle: "Our Ministries",
    ministryTag: "Ministry",
    mensTitle: "Men's Group",
    mensDesc:
      "Bringing brothers in Christ together through fellowship, accountability, and discipleship.",
    womensTitle: "Women's Group",
    womensDesc:
      "Bringing women in Christ together to grow in faith, support, and sisterhood.",
    youthTitle: "Youth Group",
    youthDesc:
      "Empowering high school aged children and older to live out their faith boldly.",
    sundaySchoolTitle: "Sunday School",
    sundaySchoolDesc:
      "Teaching the youngest members of our church the love of God through engaging lessons.",
    pastorsLabel: "Nuestros Pastores",
    pastorsTitle: "Our Pastors",
    pastorsDesc1:
      "Pastor Morris and Daisy have been faithfully serving the community since 1990, leading with love and dedication.",
    pastorsDesc2:
      "Their vision has built a vibrant multicultural church family that welcomes people from all walks of life, bringing together Spanish and English speakers in worship and fellowship.",
    statYears: "Years of Service",
    statLanguages: "Languages",
    statFamily: "Family",
    contactLabel: "Contáctanos",
    contactTitle: "Get in Touch",
    contactUs: "Contact Us",
    findUs: "Find Us",
    address: "Address",
    email: "Email",
    openMaps: "Open in Google Maps",
    footerChurch: "Spanish & English-Speaking Church",
    footerPlatform: "Ministry Platform",
    mobileSunday: "Sunday 3:00 PM — 5:00 PM",
    churchName: "Jesus Is The Way",
    heroLine1: "Jesus Is The",
    heroAccent: "Way",
    formTitle: "Send Us a Message",
    formName: "Full Name",
    formEmail: "Email",
    formPhone: "Phone (optional)",
    formMessage: "Message",
    formSubmit: "Send Message",
    formSending: "Sending...",
    formSuccess: "Message sent! We'll get back to you soon.",
    formNamePh: "Your name",
    formEmailPh: "your@email.com",
    formPhonePh: "0400 000 000",
    formMessagePh: "How can we help you?",
    eventsLabel: "What's Happening",
    eventsTitle: "Upcoming Events",
    eventsEmpty: "No upcoming events at this time. Check back soon!",
    eventsAddCal: "Add to Calendar",
    eventsViewAll: "View All Events",
    eventsMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    eventsDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    eventsToday: "Today",
  },
  es: {
    navHome: "Inicio",
    navServices: "Servicios",
    navVision: "Visión",
    navMinistries: "Ministerios",
    navPastors: "Pastores",
    navContact: "Contacto",
    heroLabel: "Bienvenidos a",
    heroSubtitle: "Eres Bienvenido Aquí",
    heroDesc1:
      "Jesús es el Camino es una iglesia multicultural de habla Hispana e Inglés que busca hacer fieles seguidores de Cristo",
    heroDesc2:
      "A multicultural Spanish and English-speaking church that seeks to make faithful followers of Christ",
    heroCta: "Acompáñanos Este Domingo",
    servicesLabel: "Acompáñanos",
    servicesTitle: "Horarios de Servicios",
    sundayTitle: "Servicio Dominical",
    sundayDesc: "Adoración, Palabra y Comunión",
    wednesdayTitle: "Miércoles en la Noche",
    wednesdayDesc: "Oración y Estudio Bíblico",
    visionLabel: "Our Vision",
    visionTitle: "Nuestra Visión",
    equipTitle: "EQUIPAR",
    equipDesc:
      "Buscamos equipar a los recién llegados con las herramientas para convertirse en discípulos devotos de Cristo, utilizando enseñanzas bíblicas dentro de la iglesia o a través de grupos de discipulado.",
    sendTitle: "ENVIAR",
    sendDesc:
      "Nuestro objetivo es enviar seguidores comprometidos a la sociedad una vez que hayan desarrollado el hábito y la disciplina de ser discípulos fieles y maduros de Cristo.",
    reachTitle: "ALCANZAR",
    reachDesc:
      "Nuestra meta es alcanzar a aquellas personas que aún no han aceptado el evangelio. Buscamos lograrlo a través de la predicación del evangelio y actos de amor.",
    missionLabel: "Nuestra Misión",
    missionLine1: "Hacer Discípulos",
    missionLine2: "para Cristo",
    missionSubtitle: "Create Disciples for Christ",
    missionDesc1:
      "La misión de la iglesia es hacer discípulos para Cristo, dándoles la bienvenida al reino y guiándolos a aceptar y seguir los mandamientos de Jesús.",
    missionDesc2:
      "The mission of the church is to make disciples for Christ, welcoming them into the kingdom and guiding them to embrace and follow Jesus' commandments.",
    ministriesLabel: "Our Ministries",
    ministriesTitle: "Nuestros Ministerios",
    ministryTag: "Ministerio",
    mensTitle: "Grupo de Hombres",
    mensDesc:
      "Uniendo a hermanos en Cristo a través de la comunión, la responsabilidad mutua y el discipulado.",
    womensTitle: "Grupo de Mujeres",
    womensDesc:
      "Uniendo a mujeres en Cristo para crecer en fe, apoyo y hermandad.",
    youthTitle: "Grupo de Jóvenes",
    youthDesc:
      "Empoderando a jóvenes de secundaria y mayores para vivir su fe con valentía.",
    sundaySchoolTitle: "Escuela Dominical",
    sundaySchoolDesc:
      "Enseñando a los miembros más jóvenes de nuestra iglesia el amor de Dios a través de lecciones dinámicas.",
    pastorsLabel: "Our Pastors",
    pastorsTitle: "Nuestros Pastores",
    pastorsDesc1:
      "El Pastor Morris y Daisy han servido fielmente a la comunidad desde 1990, liderando con amor y dedicación.",
    pastorsDesc2:
      "Su visión ha construido una vibrante familia eclesiástica multicultural que da la bienvenida a personas de todos los ámbitos de la vida, uniendo a hispanohablantes e angloparlantes en adoración y comunión.",
    statYears: "Años de Servicio",
    statLanguages: "Idiomas",
    statFamily: "Familia",
    contactLabel: "Get in Touch",
    contactTitle: "Contáctanos",
    contactUs: "Contáctanos",
    findUs: "Encuéntranos",
    address: "Dirección",
    email: "Correo",
    openMaps: "Abrir en Google Maps",
    footerChurch: "Iglesia de Habla Hispana e Inglés",
    footerPlatform: "Plataforma del Ministerio",
    mobileSunday: "Domingo 3:00 PM — 5:00 PM",
    churchName: "Jesús Es El Camino",
    heroLine1: "Jesús Es El",
    heroAccent: "Camino",
    formTitle: "Envíanos un Mensaje",
    formName: "Nombre Completo",
    formEmail: "Correo Electrónico",
    formPhone: "Teléfono (opcional)",
    formMessage: "Mensaje",
    formSubmit: "Enviar Mensaje",
    formSending: "Enviando...",
    formSuccess: "¡Mensaje enviado! Nos pondremos en contacto pronto.",
    formNamePh: "Tu nombre",
    formEmailPh: "tu@correo.com",
    formPhonePh: "0400 000 000",
    formMessagePh: "¿En qué podemos ayudarte?",
    eventsLabel: "Lo Que Viene",
    eventsTitle: "Próximos Eventos",
    eventsEmpty: "No hay eventos próximos en este momento. ¡Vuelve pronto!",
    eventsAddCal: "Agregar al Calendario",
    eventsViewAll: "Ver Todos los Eventos",
    eventsMonths: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    eventsDays: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    eventsToday: "Hoy",
  },
};

// ─── CSS-based scroll animation (no SSR opacity:0 issues) ────
function FadeInOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Shared styles ───────────────────────────────────────────
const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function IglesiaPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [heroReady, setHeroReady] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [eventsMonth, setEventsMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const l = t[lang];

  const navLinks: [string, string][] = [
    [l.navHome, "hero"],
    [l.navServices, "services"],
    [l.navVision, "vision"],
    [l.navMinistries, "ministries"],
    [l.navPastors, "pastors"],
    [lang === "en" ? "Events" : "Eventos", "events"],
    [l.navContact, "contact"],
  ];

  const fetchEvents = useCallback(() => {
    const from = `${eventsMonth.year}-${String(eventsMonth.month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(eventsMonth.year, eventsMonth.month + 1, 0).getDate();
    const to = `${eventsMonth.year}-${String(eventsMonth.month + 1).padStart(2, "0")}-${lastDay}`;
    fetch(`/api/events?from=${from}&to=${to}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, [eventsMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    const timer = setTimeout(() => setHeroReady(true), 100);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const toggleLang = () => setLang((prev) => (prev === "en" ? "es" : "en"));

  const prevMonth = () => setEventsMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 });
  const nextMonth = () => setEventsMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 });
  const goToday = () => { const now = new Date(); setEventsMonth({ year: now.getFullYear(), month: now.getMonth() }); };

  const buildGoogleCalUrl = (ev: ChurchEvent) => {
    const date = ev.event_date.replace(/-/g, "");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: `${date}/${date}`,
      details: ev.description || "",
      location: ev.location || "73 Nollamara Ave, Nollamara WA 6061",
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  };

  // Build calendar grid
  const calendarDays = (() => {
    const firstDay = new Date(eventsMonth.year, eventsMonth.month, 1).getDay();
    const daysInMonth = new Date(eventsMonth.year, eventsMonth.month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  })();

  const getEventsForDay = (day: number) => {
    const dateStr = `${eventsMonth.year}-${String(eventsMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.event_date === dateStr);
  };

  const isToday = (day: number) => {
    const now = new Date();
    return day === now.getDate() && eventsMonth.month === now.getMonth() && eventsMonth.year === now.getFullYear();
  };

  const eventTypeColors: Record<string, string> = {
    service: "#C9A86C",
    youth: "#6B8E23",
    prayer: "#8B5CF6",
    special: "#E74C3C",
    community: "#3498DB",
    conference: "#E67E22",
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    const subject = `Contact from ${formData.name}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "N/A"}\n\n${formData.message}`;
    window.location.href = `mailto:hola@jesuseselcamino.com.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      setFormStatus("sent");
      setTimeout(() => {
        setFormStatus("idle");
        setFormData({ name: "", email: "", phone: "", message: "" });
      }, 4000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* ═══════════════════════════════════════════════════════════
          STICKY HEADER
      ═══════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm border-b border-[#C9A86C]/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] sm:h-[88px]">
            {/* Logo */}
            <button
              onClick={() => scrollTo("hero")}
              className="flex items-center gap-3"
            >
              <img
                src="/iglesia/logo.png"
                alt="Jesús Es El Camino"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md"
              />
              <span
                className={`text-sm sm:text-base font-medium tracking-wide transition-colors duration-300 ${
                  scrolled ? "text-[#4A3F35]" : "text-white"
                }`}
                style={serif}
              >
                {l.churchName}
              </span>
            </button>

            {/* Desktop Nav + Lang Toggle */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                {navLinks.map(([label, id]) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`text-sm tracking-wide font-medium transition-colors duration-300 hover:text-[#C9A86C] ${
                      scrolled ? "text-[#4A3F35]" : "text-white/90"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <button
                onClick={toggleLang}
                className={`flex items-center gap-1.5 text-xs font-medium tracking-wide px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  scrolled
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
                  scrolled
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
                  scrolled ? "text-[#4A3F35]" : "text-white"
                }`}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
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
                      alt="Jesús Es El Camino"
                      className="w-16 h-16 rounded-full shadow-lg"
                    />
                    <span className="text-lg text-[#4A3F35]" style={serif}>
                      {l.churchName}
                    </span>
                  </div>
                  <nav className="flex-1 px-6 space-y-1">
                    {navLinks.map(([label, id]) => (
                      <button
                        key={id}
                        onClick={() => scrollTo(id)}
                        className="block w-full text-left px-4 py-3 text-[#4A3F35] hover:text-[#C9A86C] hover:bg-[#C9A86C]/5 rounded-lg text-base font-medium tracking-wide transition-colors"
                      >
                        {label}
                      </button>
                    ))}
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

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <img
          src="/iglesia/hero-service.jpg"
          alt="Church service"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f14]/70 via-[#1a1510]/50 to-[#0f0c08]/80" />

        <div
          className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ease-out ${
            heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <img
            src="/iglesia/logo.png"
            alt="Jesús Es El Camino"
            className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-8 rounded-full shadow-2xl shadow-black/40 ring-2 ring-[#C9A86C]/30"
          />

          <p className="text-[#C9A86C] tracking-[0.3em] text-xs sm:text-sm uppercase mb-6">
            {l.heroLabel}
          </p>

          <h1
            className="text-4xl sm:text-5xl lg:text-7xl text-white mb-6 leading-tight"
            style={{
              ...serif,
              textShadow: "4px 4px 16px rgba(0,0,0,0.5)",
            }}
          >
            {l.heroLine1}{" "}
            <span
              className="text-[#C9A86C]"
              style={{ textShadow: "2px 2px 12px rgba(201,168,108,0.4)" }}
            >
              {l.heroAccent}
            </span>
          </h1>

          <p
            className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-light mb-8"
            style={serif}
          >
            {l.heroSubtitle}
          </p>

          <div className="max-w-2xl mx-auto space-y-3 mb-12">
            <p className="text-white/70 text-sm sm:text-base leading-relaxed italic">
              {l.heroDesc1}
            </p>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed">
              {l.heroDesc2}
            </p>
          </div>

          <button
            onClick={() => scrollTo("services")}
            className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white font-medium px-10 py-4 text-sm tracking-wide transition-all shadow-lg uppercase hover:scale-105 active:scale-95"
          >
            {l.heroCta}
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 delay-[2000ms] ${
            heroReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-1.5 bg-[#C9A86C] rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SERVICE TIMES
      ═══════════════════════════════════════════════════════════ */}
      <section id="services" className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-16">
            <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
              {l.servicesLabel}
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl text-[#4A3F35] mb-4"
              style={serif}
            >
              {l.servicesTitle}
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto" />
          </FadeInOnScroll>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Sunday */}
            <FadeInOnScroll>
              <div className="group relative overflow-hidden bg-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="/iglesia/preaching.jpg"
                    alt={l.sundayTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A3F35]/80 via-[#4A3F35]/30 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-[#C9A86C] flex items-center justify-center">
                      <Sun className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl text-[#4A3F35] mb-2" style={serif}>
                    {l.sundayTitle}
                  </h3>
                  <p className="text-2xl font-semibold text-[#C9A86C] mb-1">
                    3:00 PM — 5:00 PM
                  </p>
                  <p className="text-sm text-[#6B5D4D]">{l.sundayDesc}</p>
                </div>
              </div>
            </FadeInOnScroll>

            {/* Wednesday */}
            <FadeInOnScroll delay={150}>
              <div className="group relative overflow-hidden bg-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="/iglesia/worship.jpg"
                    alt={l.wednesdayTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4A3F35]/80 via-[#4A3F35]/30 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-[#4A3F35] flex items-center justify-center">
                      <Moon className="w-6 h-6 text-[#C9A86C]" />
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl text-[#4A3F35] mb-2" style={serif}>
                    {l.wednesdayTitle}
                  </h3>
                  <p className="text-2xl font-semibold text-[#C9A86C] mb-1">
                    7:30 PM — 9:00 PM
                  </p>
                  <p className="text-sm text-[#6B5D4D]">{l.wednesdayDesc}</p>
                </div>
              </div>
            </FadeInOnScroll>
          </div>

          <FadeInOnScroll className="flex items-center justify-center gap-3">
            <MapPin className="w-5 h-5 text-[#C9A86C]" />
            <a
              href="https://maps.google.com/?q=73+Nollamara+Ave+Nollamara+WA+6061+Australia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B5D4D] hover:text-[#C9A86C] transition-colors text-base sm:text-lg"
            >
              73 Nollamara Ave, Nollamara WA 6061, Australia
            </a>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VISION — 3 Pillars
      ═══════════════════════════════════════════════════════════ */}
      <section id="vision" className="py-24 md:py-32 bg-[#F5F0E8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-16">
            <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
              {l.visionLabel}
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl text-[#4A3F35]"
              style={serif}
            >
              {l.visionTitle}
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mt-4" />
          </FadeInOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: l.equipTitle,
                desc: l.equipDesc,
                accent: "#C9A86C",
              },
              {
                icon: Send,
                title: l.sendTitle,
                desc: l.sendDesc,
                accent: "#4A3F35",
              },
              {
                icon: Heart,
                title: l.reachTitle,
                desc: l.reachDesc,
                accent: "#C9A86C",
              },
            ].map((item, i) => (
              <FadeInOnScroll key={item.title} delay={i * 150}>
                <div className="group bg-white p-8 sm:p-10 text-center shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-500 h-full">
                  <div
                    className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
                    style={{ backgroundColor: item.accent, opacity: 0.1 }}
                  />
                  <div
                    className="w-16 h-16 mx-auto -mt-16 mb-6 flex items-center justify-center relative"
                  >
                    <item.icon className="w-7 h-7" style={{ color: item.accent }} />
                  </div>
                  <h3
                    className="text-lg tracking-[0.15em] mb-4"
                    style={{ ...serif, color: item.accent }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[#6B5D4D] leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MISSION
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <img
          src="/iglesia/worship.jpg"
          alt="Worship"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-[#2a1f14]/85" />
        <FadeInOnScroll className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-6">
            {l.missionLabel}
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-6xl text-white mb-4 leading-tight"
            style={serif}
          >
            {l.missionLine1}
            <br />
            <span className="text-[#C9A86C]">{l.missionLine2}</span>
          </h2>
          <h3
            className="text-lg sm:text-xl font-light text-white/80 mb-10"
            style={serif}
          >
            {l.missionSubtitle}
          </h3>
          <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mb-10" />
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-white/70 text-base sm:text-lg leading-relaxed italic">
              {l.missionDesc1}
            </p>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed">
              {l.missionDesc2}
            </p>
          </div>
        </FadeInOnScroll>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MINISTRIES
      ═══════════════════════════════════════════════════════════ */}
      <section id="ministries" className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-16">
            <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
              {l.ministriesLabel}
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl text-[#4A3F35]"
              style={serif}
            >
              {l.ministriesTitle}
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mt-4" />
          </FadeInOnScroll>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                title: l.mensTitle,
                desc: l.mensDesc,
                img: "/iglesia/mens-group.jpg",
              },
              {
                title: l.womensTitle,
                desc: l.womensDesc,
                img: "/iglesia/womens-group.jpg",
              },
              {
                title: l.youthTitle,
                subtitle: "Zoe Zone",
                desc: l.youthDesc,
                img: "/iglesia/youth.jpg",
              },
              {
                title: l.sundaySchoolTitle,
                desc: l.sundaySchoolDesc,
                img: "/iglesia/children.jpg",
              },
            ].map((ministry, i) => (
              <FadeInOnScroll key={ministry.title} delay={i * 100}>
                <div className="group relative overflow-hidden h-72 sm:h-80 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
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
                    <h3
                      className="text-xl sm:text-2xl text-white mb-1"
                      style={serif}
                    >
                      {ministry.title}
                    </h3>
                    {ministry.subtitle && (
                      <p className="text-[#C9A86C] text-sm italic mb-2">
                        {ministry.subtitle}
                      </p>
                    )}
                    <p className="text-white/70 text-sm leading-relaxed">
                      {ministry.desc}
                    </p>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PASTORS
      ═══════════════════════════════════════════════════════════ */}
      <section id="pastors" className="py-24 md:py-32 bg-[#F5F0E8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeInOnScroll className="relative">
              <div className="overflow-hidden shadow-xl">
                <img
                  src="/iglesia/pastors.jpg"
                  alt="Pastor Morris & Daisy Velasquez"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#C9A86C] text-white p-6 hidden md:block shadow-lg">
                <p className="text-3xl font-semibold" style={serif}>
                  Since
                </p>
                <p className="text-4xl font-bold" style={serif}>
                  1990
                </p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={200}>
              <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
                {l.pastorsLabel}
              </p>
              <h2
                className="text-3xl sm:text-4xl text-[#4A3F35] mb-6"
                style={serif}
              >
                Pastor Morris &amp;{" "}
                <span className="text-[#C9A86C]">Daisy Velasquez</span>
              </h2>
              <div className="w-16 h-0.5 bg-[#C9A86C] mb-8" />
              <p className="text-[#6B5D4D] text-lg leading-relaxed mb-6">
                {l.pastorsDesc1}
              </p>
              <p className="text-[#6B5D4D] text-base leading-relaxed mb-8">
                {l.pastorsDesc2}
              </p>
              <div className="grid grid-cols-3 gap-4 border-t border-[#E8E0D5] pt-8">
                <div>
                  <p className="text-3xl text-[#C9A86C]" style={serif}>
                    35+
                  </p>
                  <p className="text-sm text-[#6B5D4D] mt-1">{l.statYears}</p>
                </div>
                <div>
                  <p className="text-3xl text-[#C9A86C]" style={serif}>
                    2
                  </p>
                  <p className="text-sm text-[#6B5D4D] mt-1">
                    {l.statLanguages}
                  </p>
                </div>
                <div>
                  <p className="text-3xl text-[#C9A86C]" style={serif}>
                    1
                  </p>
                  <p className="text-sm text-[#6B5D4D] mt-1">{l.statFamily}</p>
                </div>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          EVENTS CALENDAR
      ═══════════════════════════════════════════════════════════ */}
      <section id="events" className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-16">
            <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
              {l.eventsLabel}
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl text-[#4A3F35]"
              style={serif}
            >
              {l.eventsTitle}
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mt-4" />
          </FadeInOnScroll>

          <FadeInOnScroll>
            <div className="max-w-4xl mx-auto">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={prevMonth}
                  className="p-2 text-[#4A3F35] hover:text-[#C9A86C] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl sm:text-2xl text-[#4A3F35]" style={serif}>
                    {l.eventsMonths[eventsMonth.month]} {eventsMonth.year}
                  </h3>
                  <button
                    onClick={goToday}
                    className="text-xs px-3 py-1 border border-[#C9A86C]/30 text-[#C9A86C] hover:bg-[#C9A86C]/10 rounded-full transition-colors"
                  >
                    {l.eventsToday}
                  </button>
                </div>
                <button
                  onClick={nextMonth}
                  className="p-2 text-[#4A3F35] hover:text-[#C9A86C] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar grid */}
              <div className="bg-white shadow-sm border border-[#E8E0D5]/50 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-[#E8E0D5]">
                  {l.eventsDays.map((day: string) => (
                    <div key={day} className="py-3 text-center text-xs font-medium text-[#6B5D4D] tracking-wide uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, i) => {
                    const dayEvents = day ? getEventsForDay(day) : [];
                    const today = day ? isToday(day) : false;
                    return (
                      <div
                        key={i}
                        className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-b border-r border-[#E8E0D5]/50 ${
                          day ? "bg-white" : "bg-[#FAF8F5]"
                        }`}
                      >
                        {day && (
                          <>
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 text-sm ${
                                today
                                  ? "bg-[#C9A86C] text-white rounded-full font-semibold"
                                  : "text-[#4A3F35]"
                              }`}
                            >
                              {day}
                            </span>
                            <div className="mt-1 space-y-1">
                              {dayEvents.map((ev) => (
                                <a
                                  key={ev.id}
                                  href={buildGoogleCalUrl(ev)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate text-white hover:opacity-80 transition-opacity"
                                  style={{ backgroundColor: eventTypeColors[ev.event_type] || "#C9A86C" }}
                                  title={`${ev.title}${ev.start_time ? ` · ${ev.start_time}` : ""}`}
                                >
                                  {ev.title}
                                </a>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Events list below calendar */}
              {events.length > 0 ? (
                <div className="mt-8 space-y-4">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex gap-4 sm:gap-6 bg-white p-4 sm:p-6 shadow-sm border border-[#E8E0D5]/50 hover:shadow-md transition-shadow"
                    >
                      {/* Date badge */}
                      <div className="flex-shrink-0 w-14 sm:w-16 text-center">
                        <div
                          className="text-white text-xs font-medium py-1 uppercase tracking-wide"
                          style={{ backgroundColor: eventTypeColors[ev.event_type] || "#C9A86C" }}
                        >
                          {l.eventsMonths[new Date(ev.event_date + "T12:00:00").getMonth()]?.substring(0, 3)}
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-[#4A3F35] py-2 border border-t-0 border-[#E8E0D5]">
                          {new Date(ev.event_date + "T12:00:00").getDate()}
                        </div>
                      </div>

                      {/* Event details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg text-[#4A3F35] font-medium" style={serif}>
                          {ev.title}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#6B5D4D]">
                          {ev.start_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#C9A86C]" />
                              {ev.start_time}{ev.end_time ? ` — ${ev.end_time}` : ""}
                            </span>
                          )}
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#C9A86C]" />
                              {ev.location}
                            </span>
                          )}
                        </div>
                        {ev.description && (
                          <p className="text-sm text-[#6B5D4D]/80 mt-2 line-clamp-2">{ev.description}</p>
                        )}
                      </div>

                      {/* Add to calendar */}
                      <a
                        href={buildGoogleCalUrl(ev)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 hidden sm:flex items-center gap-1.5 self-center text-xs text-[#C9A86C] hover:text-[#B8956A] transition-colors"
                        title={l.eventsAddCal}
                      >
                        <Calendar className="w-4 h-4" />
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center py-12 bg-white shadow-sm border border-[#E8E0D5]/50">
                  <Calendar className="w-12 h-12 text-[#C9A86C]/40 mx-auto mb-4" />
                  <p className="text-[#6B5D4D] text-sm">{l.eventsEmpty}</p>
                </div>
              )}
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CONTACT
      ═══════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 md:py-32 bg-[#4A3F35]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-16">
            <p className="text-[#C9A86C] tracking-[0.3em] text-xs uppercase mb-4">
              {l.contactLabel}
            </p>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl text-white"
              style={serif}
            >
              {l.contactTitle}
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86C] mx-auto mt-4" />
          </FadeInOnScroll>

          <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Left column — Contact info + Location */}
            <div className="lg:col-span-2 space-y-10">
              <FadeInOnScroll>
                <h3 className="text-xl text-[#C9A86C] mb-6" style={serif}>
                  {l.contactUs}
                </h3>
                <div className="space-y-5">
                  {[
                    {
                      icon: Phone,
                      label: "Pastor Morris Velasquez",
                      value: "0433 370 537",
                      href: "tel:0433370537",
                    },
                    {
                      icon: Phone,
                      label: "Daisy Velasquez",
                      value: "0406 947 072",
                      href: "tel:0406947072",
                    },
                    {
                      icon: Mail,
                      label: l.email,
                      value: "hola@jesuseselcamino.com.au",
                      href: "mailto:hola@jesuseselcamino.com.au",
                    },
                  ].map((contact) => (
                    <div key={contact.label} className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white/10 flex items-center justify-center flex-shrink-0">
                        <contact.icon className="w-4.5 h-4.5 text-[#C9A86C]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {contact.label}
                        </p>
                        <a
                          href={contact.href}
                          className="text-white/60 hover:text-[#C9A86C] transition-colors text-sm"
                        >
                          {contact.value}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={100}>
                <h3 className="text-xl text-[#C9A86C] mb-6" style={serif}>
                  {l.findUs}
                </h3>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-11 h-11 bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-4.5 h-4.5 text-[#C9A86C]" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm mb-1">
                      {l.address}
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      73 Nollamara Ave
                      <br />
                      Nollamara WA 6061
                      <br />
                      Australia
                    </p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=73+Nollamara+Ave+Nollamara+WA+6061+Australia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] text-white px-6 py-2.5 text-sm font-medium tracking-wide uppercase transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {l.openMaps}
                </a>
              </FadeInOnScroll>
            </div>

            {/* Right column — Contact Form */}
            <FadeInOnScroll delay={200} className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 sm:p-10">
                <h3 className="text-xl text-[#C9A86C] mb-8" style={serif}>
                  {l.formTitle}
                </h3>

                {formStatus === "sent" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="w-14 h-14 text-[#C9A86C] mb-4" />
                    <p className="text-white text-lg" style={serif}>
                      {l.formSuccess}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-white/70 text-xs tracking-wide uppercase mb-2">
                          {l.formName} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={l.formNamePh}
                          className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-xs tracking-wide uppercase mb-2">
                          {l.formEmail} *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={l.formEmailPh}
                          className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs tracking-wide uppercase mb-2">
                        {l.formPhone}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={l.formPhonePh}
                        className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-xs tracking-wide uppercase mb-2">
                        {l.formMessage} *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={l.formMessagePh}
                        className="w-full bg-white/5 border border-white/15 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#C9A86C]/50 focus:ring-1 focus:ring-[#C9A86C]/30 transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formStatus === "sending"}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#C9A86C] hover:bg-[#B8956A] disabled:opacity-60 text-white px-8 py-3.5 text-sm font-medium tracking-wide uppercase transition-all"
                    >
                      {formStatus === "sending" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {l.formSending}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {l.formSubmit}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
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
              &copy; {new Date().getFullYear()} Jesus es el Camino inc. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
