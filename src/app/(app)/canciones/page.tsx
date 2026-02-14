"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { Song } from "@/lib/types/database";

const keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export default function CancionesPage() {
  const [search, setSearch] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeKey) params.set("key", activeKey);
      params.set("status", showDrafts ? "all" : "published");
      params.set("limit", "100");

      try {
        const res = await fetch(`/api/songs?${params}`);
        const data = await res.json();
        setSongs(data.songs || []);
        setTotal(data.total || 0);
      } catch {
        // ignore
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, activeKey, showDrafts]);

  return (
    <div className="space-y-6">
      {/* Page title and action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Biblioteca de Canciones
          {total > 0 && (
            <span className="text-base font-normal text-gray-400 ml-2">
              ({total})
            </span>
          )}
        </h2>
        <div className="flex gap-2">
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
          <Button>
            <Plus className="h-4 w-4" />
            Nueva Canción
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar canciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

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

      {/* Song list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : songs.length > 0 ? (
        <div className="grid gap-3">
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/canciones/${song.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-primary/50 hover:shadow-sm transition-all"
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
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay canciones todavía
          </h3>
          <p className="max-w-sm text-sm text-gray-500">
            Importá desde Dropbox o creá una nueva canción.
          </p>
          <Link href="/importar">
            <Button className="mt-4">Importar Canciones</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
