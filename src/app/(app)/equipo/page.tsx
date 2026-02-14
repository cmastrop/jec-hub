import { Users, Plus, Guitar, Mic, Volume2 } from "lucide-react";

export default function EquipoPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Equipo del Ministerio</h1>
          <p className="text-gray-500 mt-1">Músicos, cantantes y técnicos</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2B5EA7] text-white px-4 py-2.5 rounded-lg hover:bg-[#1e4a85] transition-colors">
          <Plus className="w-5 h-5" />
          Dar de Alta
        </button>
      </div>

      {/* Role filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { label: "Todos", icon: Users },
          { label: "Músicos", icon: Guitar },
          { label: "Cantantes", icon: Mic },
          { label: "Técnicos", icon: Volume2 },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              label === "Todos"
                ? "bg-[#2B5EA7] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No hay miembros registrados</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Dá de alta a los músicos, cantantes y técnicos de tu ministerio para poder armar rosters.
        </p>
        <button className="flex items-center gap-2 mx-auto bg-[#2B5EA7] text-white px-4 py-2.5 rounded-lg hover:bg-[#1e4a85] transition-colors">
          <Plus className="w-5 h-5" />
          Agregar Primer Miembro
        </button>
      </div>
    </div>
  );
}
