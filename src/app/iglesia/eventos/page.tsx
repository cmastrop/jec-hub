"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { ChurchEvent } from "@/lib/types/database";
import { useLang } from "@/lib/iglesia/use-lang";
import { translations } from "@/lib/iglesia/translations";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

const eventTypeColors: Record<string, string> = {
  service: "#C9A86C",
  youth: "#6B8E23",
  prayer: "#8B5CF6",
  special: "#E74C3C",
  community: "#3498DB",
  conference: "#E67E22",
};

export default function EventosPage() {
  const { lang } = useLang();
  const l = translations[lang];
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [eventsMonth, setEventsMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const fetchEvents = useCallback(() => {
    const from = `${eventsMonth.year}-${String(eventsMonth.month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(eventsMonth.year, eventsMonth.month + 1, 0).getDate();
    const to = `${eventsMonth.year}-${String(eventsMonth.month + 1).padStart(2, "0")}-${lastDay}`;
    fetch(`/api/events?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, [eventsMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const prevMonth = () =>
    setEventsMonth((m) =>
      m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
    );
  const nextMonth = () =>
    setEventsMonth((m) =>
      m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
    );
  const goToday = () => {
    const now = new Date();
    setEventsMonth({ year: now.getFullYear(), month: now.getMonth() });
  };

  const buildGoogleCalUrl = (ev: ChurchEvent) => {
    const start = ev.event_date.replace(/-/g, "");
    // Google usa fecha de fin EXCLUSIVA para eventos de día completo,
    // así que sumamos un día al end_date (o al start si es de un solo día).
    const endSource = ev.end_date || ev.event_date;
    const endExclusive = new Date(endSource + "T12:00:00");
    endExclusive.setDate(endExclusive.getDate() + 1);
    const end = `${endExclusive.getFullYear()}${String(endExclusive.getMonth() + 1).padStart(2, "0")}${String(endExclusive.getDate()).padStart(2, "0")}`;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: `${start}/${end}`,
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
    // Un evento se muestra en el día si la fecha cae dentro de su rango
    // [event_date, end_date]. Para eventos de un solo día, end_date es null.
    return events.filter((e) => {
      const start = e.event_date;
      const end = e.end_date || e.event_date;
      return dateStr >= start && dateStr <= end;
    });
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      day === now.getDate() &&
      eventsMonth.month === now.getMonth() &&
      eventsMonth.year === now.getFullYear()
    );
  };

  return (
    <>
      <PageHero
        image="/iglesia/events-hero.jpg"
        label={l.eventsLabel}
        title={l.eventsTitle1}
        titleAccent={l.eventsTitle2}
      />

      <section className="py-24 md:py-32 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-[#6B5D4D] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              {l.eventsHeroDesc}
            </p>
          </FadeIn>

          <FadeIn>
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
              <div className="bg-white shadow-sm border border-[#E8E0D5]/50 rounded-xl overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-[#E8E0D5]">
                  {l.eventsDays.map((day: string) => (
                    <div
                      key={day}
                      className="py-3 text-center text-xs font-medium text-[#6B5D4D] tracking-wide uppercase"
                    >
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
                                  className="block text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md truncate text-white hover:opacity-80 transition-opacity"
                                  style={{
                                    backgroundColor:
                                      eventTypeColors[ev.event_type] || "#C9A86C",
                                  }}
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

              {/* Events list */}
              {events.length > 0 ? (
                <div className="mt-8 space-y-4">
                  {events.map((ev, i) => (
                    <FadeIn key={ev.id} delay={i * 80}>
                      <div className="flex gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#E8E0D5]/50 hover:shadow-lg transition-shadow">
                        {/* Date badge */}
                        <div className="flex-shrink-0 w-14 sm:w-16 text-center">
                          <div
                            className="text-white text-xs font-medium py-1 uppercase tracking-wide rounded-t-md"
                            style={{
                              backgroundColor:
                                eventTypeColors[ev.event_type] || "#C9A86C",
                            }}
                          >
                            {l.eventsMonths[
                              new Date(ev.event_date + "T12:00:00").getMonth()
                            ]?.substring(0, 3)}
                          </div>
                          <div className="text-2xl sm:text-3xl font-semibold text-[#4A3F35] py-2 border border-t-0 border-[#E8E0D5] rounded-b-md">
                            {new Date(ev.event_date + "T12:00:00").getDate()}
                          </div>
                        </div>

                        {/* Event details */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-base sm:text-lg text-[#4A3F35] font-medium"
                            style={serif}
                          >
                            {ev.title}
                          </h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#6B5D4D]">
                            {ev.end_date && ev.end_date !== ev.event_date && (
                              <span className="flex items-center gap-1 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-[#C9A86C]" />
                                {new Date(ev.event_date + "T12:00:00").getDate()}
                                {" – "}
                                {new Date(ev.end_date + "T12:00:00").getDate()}{" "}
                                {l.eventsMonths[new Date(ev.end_date + "T12:00:00").getMonth()]?.substring(0, 3)}
                              </span>
                            )}
                            {ev.start_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#C9A86C]" />
                                {ev.start_time}
                                {ev.end_time ? ` — ${ev.end_time}` : ""}
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
                            <p className="text-sm text-[#6B5D4D]/80 mt-2 line-clamp-2">
                              {ev.description}
                            </p>
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
                    </FadeIn>
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center py-12 bg-white shadow-sm border border-[#E8E0D5]/50 rounded-xl">
                  <Calendar className="w-12 h-12 text-[#C9A86C]/40 mx-auto mb-4" />
                  <p className="text-[#6B5D4D] text-sm">{l.eventsEmpty}</p>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
