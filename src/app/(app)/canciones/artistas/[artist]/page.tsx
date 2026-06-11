"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Music, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Song } from "@/lib/types/database";

const keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export default function ArtistSongsPage() {
  const params = useParams();
  const artistName = decodeURIComponent(params.artist as string);

  const [songs, setSongs] = useState<Song[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    p.set("artist", artistName);
    p.set("limit", "500");
    if (search) p.set("search", search);
    if (activeKey) p.set("key", activeKey);

    try {
      const res = await fetch(`/api/songs?${p}`);
      const data = await res.json();
      setSongs(data.songs || []);
      setTotal(data.total || 0);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [artistName, search, activeKey]);

  useEffect(() => {
    const timeout = setTimeout(fetchSongs, 300);
    return () => clearTimeout(timeout);
  }, [fetchSongs]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb + title */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/canciones" className="hover:text-primary">
            Canciones
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/canciones/artistas" className="hover:text-primary">
            Artistas
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{artistName}</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {artistName}
          {total > 0 && (
            <span className="text-base font-normal text-gray-400 ml-2">
              ({total} cancion{total !== 1 ? "es" : ""})
            </span>
          )}
        </h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar en canciones de este artista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Key filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-500 self-center mr-1">
          Tonalidad:
        </span>
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => setActiveKey(activeKey === key ? null : key)}
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer ${
              activeKey === key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
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
                <h3 className="font-semibold text-foreground truncate">
                  {song.title}
                </h3>
              </div>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold ml-4 shrink-0">
                {song.original_key}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Sin resultados
          </h3>
          <p className="max-w-sm text-sm text-gray-500">
            No se encontraron canciones con esos filtros.
          </p>
        </div>
      )}
    </div>
  );
}
