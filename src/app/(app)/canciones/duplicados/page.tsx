"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Trash2, ExternalLink, Copy } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";

interface DuplicateSong {
  id: string;
  title: string;
  artist: string | null;
  original_key: string;
  status: string;
  source_type: string;
  created_at: string;
}

interface DuplicateGroup {
  normalizedTitle: string;
  songs: DuplicateSong[];
}

const sourceLabels: Record<string, string> = {
  manual: "Manual",
  import_image: "Imagen",
  import_pdf: "PDF",
  import_dropbox: "Dropbox",
};

export default function DuplicadosPage() {
  const { isAdmin } = useUser();
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/songs/duplicates")
      .then((res) => res.json())
      .then((data) => {
        setGroups(data.groups || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(songId: string) {
    if (!confirm("Eliminar esta cancion?")) return;
    setDeletingId(songId);
    try {
      const res = await fetch(`/api/songs/${songId}`, { method: "DELETE" });
      if (res.ok) {
        setGroups((prev) =>
          prev
            .map((g) => ({
              ...g,
              songs: g.songs.filter((s) => s.id !== songId),
            }))
            .filter((g) => g.songs.length > 1)
        );
      }
    } catch {
      // ignore
    }
    setDeletingId(null);
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Solo administradores pueden ver esta pagina.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/canciones"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a canciones
        </Link>
        <h1 className="text-2xl font-bold">Posibles Duplicados</h1>
        <p className="text-gray-500 mt-1">
          Canciones con titulos similares que podrian ser duplicados
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <Copy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No hay duplicados</h3>
          <p className="text-gray-400">Todas las canciones tienen titulos unicos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            {groups.length} grupo{groups.length !== 1 ? "s" : ""} de posibles duplicados encontrados
          </p>
          {groups.map((group) => (
            <div
              key={group.normalizedTitle}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
                <h3 className="font-semibold text-amber-800">
                  &quot;{group.normalizedTitle}&quot;
                  <span className="text-sm font-normal text-amber-600 ml-2">
                    ({group.songs.length} versiones)
                  </span>
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {group.songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{song.title}</span>
                        <span className="shrink-0 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {song.original_key}
                        </span>
                        <span
                          className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                            song.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {song.status === "published" ? "Publicada" : "Borrador"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {song.artist && <span>{song.artist}</span>}
                        <span>{sourceLabels[song.source_type] || song.source_type}</span>
                        <span>{new Date(song.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <Link
                        href={`/canciones/${song.id}`}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Ver cancion"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(song.id)}
                        disabled={deletingId === song.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
