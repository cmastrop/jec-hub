import { Calendar, Plus } from "lucide-react";

export default function ProgramasPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Programas</h1>
          <p className="text-gray-500 mt-1">Setlists para los servicios</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2B5EA7] text-white px-4 py-2.5 rounded-lg hover:bg-[#1e4a85] transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Programa
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["Todos", "Domingo", "Miércoles", "Jóvenes", "Especial"].map((type) => (
          <button
            key={type}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              type === "Todos"
                ? "bg-[#2B5EA7] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No hay programas todavía</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Creá un programa para organizar las canciones de tu próximo servicio.
        </p>
        <button className="flex items-center gap-2 mx-auto bg-[#2B5EA7] text-white px-4 py-2.5 rounded-lg hover:bg-[#1e4a85] transition-colors">
          <Plus className="w-5 h-5" />
          Crear Primer Programa
        </button>
      </div>
    </div>
  );
}
