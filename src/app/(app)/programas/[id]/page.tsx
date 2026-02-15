"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  X,
  Music,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { SongSearchModal } from "@/components/setlist/song-search-modal";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SetlistSong } from "@/lib/types/database";

const typeColors: Record<string, string> = {
  domingo: "bg-blue-100 text-blue-700",
  miercoles: "bg-yellow-100 text-yellow-700",
  jovenes: "bg-purple-100 text-purple-700",
  oracion: "bg-emerald-100 text-emerald-700",
  especial: "bg-pink-100 text-pink-700",
  otro: "bg-gray-100 text-gray-700",
};

const typeLabels: Record<string, string> = {
  domingo: "Domingo",
  miercoles: "Miercoles",
  jovenes: "Jovenes",
  oracion: "Oracion",
  especial: "Especial",
  otro: "Otro",
};

function SortableSongItem({
  item,
  index,
  onRemove,
  isAdmin,
}: {
  item: SetlistSong;
  index: number;
  onRemove: (id: string) => void;
  isAdmin: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 hover:border-primary/30 transition-colors"
    >
      {isAdmin && (
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>
      <Link
        href={`/canciones/${item.song_id}`}
        className="flex-1 min-w-0 hover:text-primary transition-colors"
      >
        <h4 className="font-medium text-sm truncate">
          {item.song?.title || "Cancion"}
        </h4>
        {item.song?.artist && (
          <p className="text-xs text-gray-500 truncate">{item.song.artist}</p>
        )}
      </Link>
      <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
        {item.transpose_key || item.song?.original_key || "?"}
      </span>
      {isAdmin && (
        <button
          onClick={() => onRemove(item.id)}
          className="shrink-0 p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function ProgramaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useUser();

  const [setlist, setSetlist] = useState<{
    id: string;
    title: string;
    service_type: string;
    service_date: string | null;
    notes: string | null;
  } | null>(null);
  const [songs, setSongs] = useState<SetlistSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("domingo");
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadSetlist = useCallback(async () => {
    try {
      const res = await fetch(`/api/setlists/${params.id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSetlist(data);
      setSongs(data.songs || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    loadSetlist();
  }, [loadSetlist]);

  async function handleAddSong(songId: string, song: { id: string; title: string; artist: string | null; original_key: string }) {
    try {
      const res = await fetch(`/api/setlists/${params.id}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song_id: songId }),
      });
      if (res.ok) {
        const newItem = await res.json();
        // Attach song info
        newItem.song = { id: song.id, title: song.title, artist: song.artist, original_key: song.original_key };
        setSongs((prev) => [...prev, newItem]);
      }
    } catch {
      // ignore
    }
  }

  async function handleRemoveSong(setlistSongId: string) {
    try {
      const res = await fetch(`/api/setlists/${params.id}/songs?song_id=${setlistSongId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== setlistSongId));
      }
    } catch {
      // ignore
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = songs.findIndex((s) => s.id === active.id);
    const newIndex = songs.findIndex((s) => s.id === over.id);
    const newSongs = arrayMove(songs, oldIndex, newIndex);
    setSongs(newSongs);

    // Save new order
    try {
      await fetch(`/api/setlists/${params.id}/songs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songs: newSongs.map((s, i) => ({ id: s.id, position: i + 1 })),
        }),
      });
    } catch {
      // revert on error
      setSongs(songs);
    }
  }

  async function handleEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/setlists/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          service_type: editType,
          service_date: editDate || null,
          notes: editNotes.trim() || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSetlist(data);
        setShowEdit(false);
      }
    } catch {
      // ignore
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/setlists/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/programas");
      }
    } catch {
      // ignore
    }
    setDeleting(false);
  }

  function openEdit() {
    if (!setlist) return;
    setEditTitle(setlist.title);
    setEditType(setlist.service_type);
    setEditDate(setlist.service_date || "");
    setEditNotes(setlist.notes || "");
    setShowEdit(true);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Sin fecha";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!setlist) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Programa no encontrado</h2>
        <Link href="/programas" className="text-primary hover:underline text-sm">
          Volver a programas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href="/programas"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a programas
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{setlist.title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full ${typeColors[setlist.service_type] || typeColors.otro}`}>
              {typeLabels[setlist.service_type] || setlist.service_type}
            </span>
          </div>
          <p className="text-gray-500">{formatDate(setlist.service_date)}</p>
          {setlist.notes && (
            <p className="text-sm text-gray-600 mt-2">{setlist.notes}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1.5 rounded-full transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1.5 rounded-full transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Songs list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Canciones ({songs.length})
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-1.5 text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-[#1e4a85] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          )}
        </div>

        {songs.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={songs.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {songs.map((item, index) => (
                  <SortableSongItem
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={handleRemoveSong}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <Music className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-3">No hay canciones en este programa</p>
            {isAdmin && (
              <button
                onClick={() => setShowSearch(true)}
                className="inline-flex items-center gap-1.5 text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-[#1e4a85] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar cancion
              </button>
            )}
          </div>
        )}
      </div>

      {/* Song search modal */}
      <SongSearchModal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        onSelect={handleAddSong}
        excludeIds={songs.map((s) => s.song_id)}
      />

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Editar Programa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none text-sm"
                >
                  {Object.entries(typeLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5EA7] focus:border-transparent outline-none text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEdit}
                  disabled={saving || !editTitle.trim()}
                  className="px-4 py-2 text-sm rounded-lg bg-[#2B5EA7] text-white hover:bg-[#1e4a85] disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Eliminar programa</h3>
            <p className="text-sm text-gray-600 mb-4">
              Estas seguro de eliminar &quot;{setlist.title}&quot;? Esto eliminara tambien todas las canciones asociadas.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
