"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Music, Loader2 } from "lucide-react";

interface SongResult {
  id: string;
  title: string;
  artist: string | null;
  original_key: string;
}

interface SongSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (songId: string, song: SongResult) => void;
  excludeIds?: string[];
}

export function SongSearchModal({ open, onClose, onSelect, excludeIds = [] }: SongSearchModalProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SongResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          status: "published",
          limit: "20",
        });
        const res = await fetch(`/api/songs?${params}`);
        const data = await res.json();
        const filtered = (data.songs || []).filter(
          (s: SongResult) => !excludeIds.includes(s.id)
        );
        setResults(filtered);
      } catch {
        // ignore
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, open, excludeIds]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar cancion para agregar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.map((song) => (
                <button
                  key={song.id}
                  onClick={() => {
                    onSelect(song.id, song);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm truncate">{song.title}</h4>
                    {song.artist && (
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    )}
                  </div>
                  <span className="shrink-0 ml-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {song.original_key}
                  </span>
                </button>
              ))}
            </div>
          ) : search.trim() ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Music className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No se encontraron canciones</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Escribe para buscar canciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
