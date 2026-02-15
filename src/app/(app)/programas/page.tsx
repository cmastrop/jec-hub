"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Loader2, Music, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Setlist } from "@/lib/types/database";

const serviceTypes = [
  { value: "", label: "Todos" },
  { value: "domingo", label: "Domingo" },
  { value: "miercoles", label: "Miercoles" },
  { value: "jovenes", label: "Jovenes" },
  { value: "oracion", label: "Oracion" },
  { value: "especial", label: "Especial" },
  { value: "otro", label: "Otro" },
];

const typeColors: Record<string, string> = {
  domingo: "bg-blue-100 text-blue-700",
  miercoles: "bg-yellow-100 text-yellow-700",
  jovenes: "bg-purple-100 text-purple-700",
  oracion: "bg-emerald-100 text-emerald-700",
  especial: "bg-pink-100 text-pink-700",
  otro: "bg-gray-100 text-gray-700",
};

export default function ProgramasPage() {
  const { isAdmin } = useUser();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("domingo");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    async function loadSetlists() {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeType) params.set("service_type", activeType);
      try {
        const res = await fetch(`/api/setlists?${params}`);
        const data = await res.json();
        setSetlists(data.setlists || []);
      } catch {
        // ignore
      }
      setLoading(false);
    }
    loadSetlists();
  }, [activeType]);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/setlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          service_type: newType,
          service_date: newDate || null,
          notes: newNotes.trim() || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSetlists((prev) => [data, ...prev]);
        setShowCreate(false);
        setNewTitle("");
        setNewType("domingo");
        setNewDate("");
        setNewNotes("");
      }
    } catch {
      // ignore
    }
    setCreating(false);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Sin fecha";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Programas</h1>
          <p className="text-gray-500 mt-1">Setlists para los servicios</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#2B5EA7] text-white px-4 py-2.5 rounded-lg hover:bg-[#1e4a85] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Programa
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {serviceTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeType === type.value
                ? "bg-[#2B5EA7] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nuevo Programa</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Servicio Domingo 16/02"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none text-sm"
                >
                  {serviceTypes.slice(1).map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas opcionales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim()}
                  className="px-4 py-2 text-sm rounded-lg bg-[#2B5EA7] text-white hover:bg-[#1e4a85] transition-colors disabled:opacity-50"
                >
                  {creating ? "Creando..." : "Crear Programa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setlist list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : setlists.length > 0 ? (
        <div className="grid gap-3">
          {setlists.map((setlist) => (
            <Link
              key={setlist.id}
              href={`/programas/${setlist.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{setlist.title}</h3>
                  <span className={cn("shrink-0 text-xs px-2 py-0.5 rounded-full", typeColors[setlist.service_type] || typeColors.otro)}>
                    {serviceTypes.find((t) => t.value === setlist.service_type)?.label || setlist.service_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{formatDate(setlist.service_date)}</span>
                  {typeof setlist.song_count === "number" && (
                    <span className="flex items-center gap-1">
                      <Music className="w-3.5 h-3.5" />
                      {setlist.song_count} cancion{setlist.song_count !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No hay programas todavia</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Crea un programa para organizar las canciones de tu proximo servicio.
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 mx-auto bg-[#2B5EA7] text-white px-4 py-2.5 rounded-lg hover:bg-[#1e4a85] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Programa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
