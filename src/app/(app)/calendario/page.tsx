import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarioPage() {
  const today = new Date();
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Calendario de Servicios</h1>
        <p className="text-gray-500 mt-1">Vista mensual de servicios y rosters</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
          {cells.map((day, i) => (
            <div
              key={i}
              className={`min-h-[100px] p-2 border-b border-r border-gray-100 ${
                day === today.getDate() ? "bg-blue-50" : ""
              } ${!day ? "bg-gray-50" : "hover:bg-gray-50 cursor-pointer"}`}
            >
              {day && (
                <>
                  <span className={`text-sm font-medium ${
                    day === today.getDate()
                      ? "bg-[#2B5EA7] text-white w-7 h-7 rounded-full inline-flex items-center justify-center"
                      : "text-gray-700"
                  }`}>
                    {day}
                  </span>
                  {/* Sunday indicator */}
                  {((startDay + day - 1) % 7) === 6 && (
                    <div className="mt-1 text-xs bg-blue-100 text-[#2B5EA7] rounded px-1.5 py-0.5 truncate">
                      Servicio Domingo
                    </div>
                  )}
                  {/* Wednesday indicator */}
                  {((startDay + day - 1) % 7) === 2 && (
                    <div className="mt-1 text-xs bg-yellow-100 text-[#B8960C] rounded px-1.5 py-0.5 truncate">
                      Servicio Miércoles
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2B5EA7]" /> Domingo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#B8960C]" /> Miércoles
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500" /> Jóvenes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Especial
        </span>
      </div>
    </div>
  );
}
