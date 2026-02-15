"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CalendarSetlist {
  id: string;
  title: string;
  service_type: string;
  service_date: string;
}

const typeColors: Record<string, { bg: string; text: string; dot: string }> = {
  domingo: { bg: "bg-blue-100", text: "text-[#2B5EA7]", dot: "bg-[#2B5EA7]" },
  miercoles: { bg: "bg-yellow-100", text: "text-[#B8960C]", dot: "bg-[#B8960C]" },
  jovenes: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  oracion: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  especial: { bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500" },
  otro: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
};

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [setlists, setSetlists] = useState<CalendarSetlist[]>([]);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNames = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  useEffect(() => {
    async function loadSetlists() {
      try {
        const params = new URLSearchParams({
          month: String(month + 1),
          year: String(year),
        });
        const res = await fetch(`/api/setlists?${params}`);
        const data = await res.json();
        setSetlists(data.setlists || []);
      } catch {
        // ignore
      }
    }
    loadSetlists();
  }, [month, year]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  function getSetlistsForDay(day: number): CalendarSetlist[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return setlists.filter((s) => s.service_date === dateStr);
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Calendario de Servicios</h1>
        <p className="text-gray-500 mt-1">Vista mensual de servicios y programas</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">
            {monthNames[month]} {year}
          </h2>
          {!isCurrentMonth && (
            <button
              onClick={goToday}
              className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
            >
              Hoy
            </button>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-b">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const daySetlists = day ? getSetlistsForDay(day) : [];
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <div
                key={i}
                className={`min-h-[100px] p-2 border-b border-r border-gray-100 ${
                  isToday ? "bg-blue-50" : ""
                } ${!day ? "bg-gray-50" : ""}`}
              >
                {day && (
                  <>
                    <span className={`text-sm font-medium ${
                      isToday
                        ? "bg-[#2B5EA7] text-white w-7 h-7 rounded-full inline-flex items-center justify-center"
                        : "text-gray-700"
                    }`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {daySetlists.map((sl) => {
                        const colors = typeColors[sl.service_type] || typeColors.otro;
                        return (
                          <Link
                            key={sl.id}
                            href={`/programas/${sl.id}`}
                            className={`block text-xs ${colors.bg} ${colors.text} rounded px-1.5 py-0.5 truncate hover:opacity-80 transition-opacity`}
                          >
                            {sl.title}
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-sm text-gray-500 flex-wrap">
        {Object.entries(typeColors).map(([type, colors]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
