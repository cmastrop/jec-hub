"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Music, Trash2, Filter, X, CheckSquare, Square, AlertTriangle, Users, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";
import type { Song } from "@/lib/types/database";

const keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  import_image: "Imagen",
  import_pdf: "PDF",
  import_dropbox: "Dropbox",
};

const sortOptions = [
  { value: "title", label: "Titulo" },
  { value: "artist", label: "Artista" },
  { value: "created_at", label: "Fecha" },
  { value: "key", label: "Tonalidad" },
];

export default function CancionesPage() {
  const { isAdmin } = useUser();
  const [search, setSearch] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDrafts, setShowDrafts] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [artistFilter, setArtistFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("title");

  // Bulk selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Duplicates
  const [duplicateCount, setDuplicateCount] = useState(0);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeKey) params.set("key", activeKey);
    if (artistFilter) params.set("artist", artistFilter);
    if (sourceFilter) params.set("source_type", sourceFilter);
    if (sortBy !== "title") params.set("sort", sortBy);
    params.set("status", showDrafts ? "all" : "published");
    params.set("limit", "200");

    try {
      const res = await fetch(`/api/songs?${params}`);
      const data = await res.json();
      setSongs(data.songs || []);
      setTotal(data.total || 0);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [search, activeKey, showDrafts, artistFilter, sourceFilter, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(fetchSongs, 300);
    return () => clearTimeout(timeout);
  }, [fetchSongs]);

  // Fetch duplicate count for admin
  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/songs/duplicates")
      .then((res) => res.json())
      .then((data) => setDuplicateCount(data.totalGroups || 0))
      .catch(() => {});
  }, [isAdmin]);

  async function handleDelete(e: React.MouseEvent, songId: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Eliminar esta cancion?")) return;
    setDeletingId(songId);
    try {
      const res = await fetch(`/api/songs/${songId}`, { method: "DELETE" });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== songId));
        setTotal((prev) => prev - 1);
      }
    } catch {
      // ignore
    }
    setDeletingId(null);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === songs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(songs.map((s) => s.id)));
    }
  }

  async function handleBulkAction(status: "published" | "draft") {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const res = await fetch("/api/songs/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status }),
      });
      if (res.ok) {
        setSelectionMode(false);
        setSelectedIds(new Set());
        fetchSongs();
      }
    } catch {
      // ignore
    }
    setBulkProcessing(false);
  }

  const hasActiveFilters = artistFilter || sourceFilter || sortBy !== "title";

  return (
    <div className="space-y-6">
      {/* Page title and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Biblioteca de Canciones
          {total > 0 && (
            <span className="text-base font-normal text-gray-400 ml-2">
              ({total})
            </span>
          )}
        </h2>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && duplicateCount > 0 && (
            <Link
              href="/canciones/duplicados"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              {duplicateCount} duplicados
            </Link>
          )}
          <button
            onClick={() => setShowDrafts(!showDrafts)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              showDrafts
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {showDrafts ? "Mostrando todas" : "Mostrar borradores"}
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds(new Set());
              }}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectionMode
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {selectionMode ? "Cancelar seleccion" : "Seleccionar"}
            </button>
          )}
          {isAdmin && (
            <Link href="/importar">
              <Button>
                <Plus className="h-4 w-4" />
                Importar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Browse by artist / category */}
      <div className="flex gap-3">
        <Link
          href="/canciones/artistas"
          className="flex-1 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-primary/50 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Por Artista</h3>
            <p className="text-xs text-gray-500">Navega por artista</p>
          </div>
        </Link>
        <Link
          href="/canciones/categorias"
          className="flex-1 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-primary/50 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Por Categoria</h3>
            <p className="text-xs text-gray-500">Adoracion, Cantautores, Worship...</p>
          </div>
        </Link>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar canciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            showFilters || hasActiveFilters
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && !showFilters && (
            <span className="w-2 h-2 rounded-full bg-white" />
          )}
        </button>
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Artista</label>
              <input
                type="text"
                placeholder="Filtrar por artista..."
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Origen</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todos</option>
                <option value="manual">Manual</option>
                <option value="import_image">Imagen</option>
                <option value="import_pdf">PDF</option>
                <option value="import_dropbox">Dropbox</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Activos:</span>
              {artistFilter && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Artista: {artistFilter}
                  <button onClick={() => setArtistFilter("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {sourceFilter && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Origen: {sourceLabels[sourceFilter] || sourceFilter}
                  <button onClick={() => setSourceFilter("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {sortBy !== "title" && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Orden: {sortOptions.find((o) => o.value === sortBy)?.label}
                  <button onClick={() => setSortBy("title")}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={() => { setArtistFilter(""); setSourceFilter(""); setSortBy("title"); }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Key filter badges */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-500 self-center mr-1">
          Tonalidad:
        </span>
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => setActiveKey(activeKey === key ? null : key)}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer",
              activeKey === key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Select all when in selection mode */}
      {selectionMode && songs.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {selectedIds.size === songs.length ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedIds.size === songs.length ? "Deseleccionar todo" : "Seleccionar todo"}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-gray-500">
              {selectedIds.size} seleccionada{selectedIds.size !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Song list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : songs.length > 0 ? (
        <div className="grid gap-3">
          {songs.map((song) => (
            <div key={song.id} className="flex items-center gap-2">
              {selectionMode && (
                <button
                  onClick={() => toggleSelect(song.id)}
                  className="shrink-0 p-1"
                >
                  {selectedIds.has(song.id) ? (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              )}
              <Link
                href={`/canciones/${song.id}`}
                className="flex-1 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {song.title}
                    </h3>
                    {song.status === "draft" && (
                      <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Borrador
                      </span>
                    )}
                  </div>
                  {song.artist && (
                    <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {song.original_key}
                  </span>
                </div>
              </Link>
              {isAdmin && !selectionMode && (
                <button
                  onClick={(e) => handleDelete(e, song.id)}
                  disabled={deletingId === song.id}
                  className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Eliminar cancion"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay canciones todavia
          </h3>
          <p className="max-w-sm text-sm text-gray-500">
            Importa desde Dropbox o crea una nueva cancion.
          </p>
          <Link href="/importar">
            <Button className="mt-4">Importar Canciones</Button>
          </Link>
        </div>
      )}

      {/* Bulk action bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedIds.size} cancion{selectedIds.size !== 1 ? "es" : ""} seleccionada{selectedIds.size !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction("published")}
                disabled={bulkProcessing}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Publicar
              </button>
              <button
                onClick={() => handleBulkAction("draft")}
                disabled={bulkProcessing}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                Borrador
              </button>
              <button
                onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
