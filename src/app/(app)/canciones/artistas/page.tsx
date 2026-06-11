"use client";

import { useState, useEffect } from "react";
import { Search, Music, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ArtistItem {
  name: string;
  count: number;
}

export default function ArtistasPage() {
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/songs/artists")
      .then((res) => res.json())
      .then((data) => {
        setArtists(data.artists || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? artists.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
      )
    : artists;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/canciones" className="hover:text-primary">
              Canciones
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Artistas</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Artistas
            {artists.length > 0 && (
              <span className="text-base font-normal text-gray-400 ml-2">
                ({artists.length})
              </span>
            )}
          </h2>
        </div>
        <Link
          href="/canciones/categorias"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver por Categorias →
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar artista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Artist list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-2">
          {filtered.map((artist) => (
            <Link
              key={artist.name}
              href={`/canciones/artistas/${encodeURIComponent(artist.name)}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground truncate">
                  {artist.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="text-sm text-gray-500">
                  {artist.count} cancion{artist.count !== 1 ? "es" : ""}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
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
            {search ? "Sin resultados" : "No hay artistas"}
          </h3>
          <p className="max-w-sm text-sm text-gray-500">
            {search
              ? `No se encontraron artistas con "${search}"`
              : "Importa canciones para ver artistas aqui."}
          </p>
        </div>
      )}
    </div>
  );
}
