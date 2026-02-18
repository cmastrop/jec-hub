"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarPlus,
  Shield,
  Loader2,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import type { ChurchEvent, EventType, EventStatus } from "@/lib/types/database";

const eventTypeLabels: Record<EventType, string> = {
  service: "Servicio",
  youth: "Jovenes",
  prayer: "Oracion",
  special: "Especial",
  community: "Comunidad",
  conference: "Conferencia",
};

const eventTypeColors: Record<EventType, string> = {
  service: "bg-blue-100 text-blue-700",
  youth: "bg-purple-100 text-purple-700",
  prayer: "bg-emerald-100 text-emerald-700",
  special: "bg-pink-100 text-pink-700",
  community: "bg-amber-100 text-amber-700",
  conference: "bg-indigo-100 text-indigo-700",
};

const statusConfig: Record<EventStatus, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-gray-100 text-gray-600" },
  approved: { label: "Aprobado", color: "bg-yellow-100 text-yellow-700" },
  published: { label: "Publicado", color: "bg-green-100 text-green-700" },
};

const defaultForm = {
  title: "",
  description: "",
  event_date: "",
  start_time: "",
  end_time: "",
  location: "73 Nollamara Ave, Nollamara WA 6061",
  event_type: "service" as EventType,
  status: "draft" as EventStatus,
  recurring: false,
  recurring_day: "",
};

export default function EventosPage() {
  const { isAdmin } = useUser();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "?status=draft&all=1";
      let url = "/api/events";
      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      } else {
        // Load all statuses separately and merge
        const [draftRes, approvedRes, publishedRes] = await Promise.all([
          fetch("/api/events?status=draft"),
          fetch("/api/events?status=approved"),
          fetch("/api/events?status=published"),
        ]);
        const [drafts, approved, published] = await Promise.all([
          draftRes.ok ? draftRes.json() : [],
          approvedRes.ok ? approvedRes.json() : [],
          publishedRes.ok ? publishedRes.json() : [],
        ]);
        const all = [...(drafts || []), ...(approved || []), ...(published || [])];
        all.sort((a: ChurchEvent, b: ChurchEvent) => a.event_date.localeCompare(b.event_date));
        setEvents(all);
        setLoading(false);
        return;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    loadEvents();
  }, [isAdmin, loadEvents]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      ...form,
      recurring_day: form.recurring ? form.recurring_day : null,
    };

    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/events/${editingId}` : "/api/events";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setForm(defaultForm);
        setShowForm(false);
        setEditingId(null);
        setLoading(true);
        loadEvents();
      } else {
        const err = await res.json();
        alert(err.error || "Error al guardar evento");
      }
    } catch {
      alert("Error de conexion");
    }
    setSaving(false);
  }

  async function handleStatusChange(id: string, newStatus: EventStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) =>
          prev.map((ev) => (ev.id === id ? updated : ev))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Error al actualizar estado");
      }
    } catch {
      alert("Error de conexion");
    }
    setUpdatingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este evento?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Error al eliminar");
      }
    } catch {
      alert("Error de conexion");
    }
    setDeletingId(null);
  }

  function startEdit(ev: ChurchEvent) {
    setForm({
      title: ev.title,
      description: ev.description || "",
      event_date: ev.event_date,
      start_time: ev.start_time || "",
      end_time: ev.end_time || "",
      location: ev.location || "",
      event_type: ev.event_type,
      status: ev.status,
      recurring: ev.recurring,
      recurring_day: ev.recurring_day || "",
    });
    setEditingId(ev.id);
    setShowForm(true);
  }

  function cancelForm() {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Acceso restringido
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Solo los administradores pueden gestionar eventos.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const drafts = events.filter((e) => e.status === "draft");
  const approved = events.filter((e) => e.status === "approved");
  const published = events.filter((e) => e.status === "published");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Gestion de Eventos
          </h2>
          <p className="text-gray-500 mt-1">
            Crea, aprueba y publica eventos de la iglesia
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(defaultForm);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <CalendarPlus className="w-4 h-4" />
          Nuevo Evento
        </button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold">
            {editingId ? "Editar Evento" : "Nuevo Evento"}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titulo *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Ej: Culto Dominical"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripcion
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                placeholder="Detalles del evento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora inicio
              </label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora fin
              </label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicacion
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="draft">Borrador</option>
                <option value="approved">Aprobado</option>
                <option value="published">Publicado</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Evento recurrente
              </label>
              {form.recurring && (
                <select
                  value={form.recurring_day}
                  onChange={(e) => setForm({ ...form, recurring_day: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                >
                  <option value="">Seleccionar dia</option>
                  <option value="sunday">Domingo</option>
                  <option value="monday">Lunes</option>
                  <option value="tuesday">Martes</option>
                  <option value="wednesday">Miercoles</option>
                  <option value="thursday">Jueves</option>
                  <option value="friday">Viernes</option>
                  <option value="saturday">Sabado</option>
                </select>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {editingId ? "Guardar Cambios" : "Crear Evento"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "draft", "approved", "published"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setLoading(true);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all"
              ? `Todos (${events.length})`
              : `${statusConfig[s].label} (${
                  s === "draft"
                    ? drafts.length
                    : s === "approved"
                    ? approved.length
                    : published.length
                })`}
          </button>
        ))}
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <CalendarPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay eventos</p>
          <p className="text-sm text-gray-400 mt-1">
            Crea el primer evento para la iglesia
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onEdit={() => startEdit(ev)}
              onDelete={() => handleDelete(ev.id)}
              onStatusChange={(status) => handleStatusChange(ev.id, status)}
              isDeleting={deletingId === ev.id}
              isUpdating={updatingId === ev.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting,
  isUpdating,
}: {
  event: ChurchEvent;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: EventStatus) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[event.status];
  const typeColor = eventTypeColors[event.event_type];
  const typeLabel = eventTypeLabels[event.event_type];

  const dateFormatted = new Date(event.event_date + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Date badge */}
        <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0">
          <span className="text-xs text-gray-500 uppercase leading-none">
            {new Date(event.event_date + "T00:00:00").toLocaleDateString("es-ES", { month: "short" })}
          </span>
          <span className="text-lg font-bold text-foreground leading-none mt-0.5">
            {new Date(event.event_date + "T00:00:00").getDate()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">
              {event.title}
            </h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>
              {typeLabel}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="sm:hidden">{dateFormatted}</span>
            <span className="hidden sm:inline">{dateFormatted}</span>
            {event.start_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {event.start_time.slice(0, 5)}
                {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
              </span>
            )}
            {event.location && (
              <span className="hidden md:flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {event.status === "draft" && (
            <button
              onClick={() => onStatusChange("published")}
              disabled={isUpdating}
              className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
              title="Publicar"
            >
              {isUpdating ? "..." : "Publicar"}
            </button>
          )}
          {event.status === "approved" && (
            <button
              onClick={() => onStatusChange("published")}
              disabled={isUpdating}
              className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
              title="Publicar"
            >
              {isUpdating ? "..." : "Publicar"}
            </button>
          )}
          {event.status === "published" && (
            <button
              onClick={() => onStatusChange("draft")}
              disabled={isUpdating}
              className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
              title="Despublicar"
            >
              {isUpdating ? "..." : "Despublicar"}
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 text-sm space-y-2">
          {event.description && (
            <p className="text-gray-600">{event.description}</p>
          )}
          {event.location && (
            <p className="text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {event.location}
            </p>
          )}
          {event.recurring && (
            <p className="text-gray-500">
              Recurrente: cada {event.recurring_day || "—"}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Creado: {new Date(event.created_at).toLocaleString("es-ES")}
          </p>
        </div>
      )}
    </div>
  );
}
