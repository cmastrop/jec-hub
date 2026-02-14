"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChordChart } from "@/components/song/chord-chart";
import { TransposeControls } from "@/components/song/transpose-controls";
import { FontSizeControls } from "@/components/song/font-size-controls";
import { NotationToggle } from "@/components/song/notation-toggle";
import { getKeyFromSemitoneOffset } from "@/lib/chordpro/transpose";
import { useUser } from "@/hooks/use-user";
import type { NotationMode } from "@/lib/chordpro/types";
import type { Song } from "@/lib/types/database";
import { ArrowLeft, Loader2, Trash2, CheckCircle, Pencil } from "lucide-react";
import Link from "next/link";

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useUser();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semitones, setSemitones] = useState(0);
  const [targetKey, setTargetKey] = useState("");
  const [fontSize, setFontSize] = useState(18);
  const [notation, setNotation] = useState<NotationMode>("letter");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    async function loadSong() {
      try {
        const res = await fetch(`/api/songs/${params.id}`);
        if (!res.ok) {
          setError("Cancion no encontrada");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSong(data);
        setTargetKey(data.original_key || "C");
        setEditContent(data.chordpro_content || "");
      } catch {
        setError("Error al cargar la cancion");
      }
      setLoading(false);
    }
    loadSong();
  }, [params.id]);

  const originalKey = song?.original_key || "C";
  const currentKey = useMemo(
    () => getKeyFromSemitoneOffset(originalKey, semitones),
    [originalKey, semitones]
  );

  const handleTransposeChange = (
    newSemitones: number,
    newTargetKey: string
  ) => {
    setSemitones(newSemitones);
    setTargetKey(newTargetKey);
  };

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/songs/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/canciones");
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar");
      }
    } catch {
      alert("Error al eliminar la cancion");
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  }

  async function handlePublish() {
    try {
      const res = await fetch(`/api/songs/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (res.ok) {
        const data = await res.json();
        setSong(data);
      }
    } catch {
      // ignore
    }
  }

  async function handleSaveEdit() {
    try {
      const res = await fetch(`/api/songs/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chordpro_content: editContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setSong(data);
        setEditing(false);
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {error || "Cancion no encontrada"}
        </h2>
        <Link
          href="/canciones"
          className="text-primary hover:underline text-sm"
        >
          Volver a canciones
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/canciones"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a canciones
            </Link>
            <div className="flex items-center gap-2">
              {song.status === "draft" && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  Borrador
                </span>
              )}
              {isAdmin && (
                <>
                  {song.status === "draft" && (
                    <button
                      onClick={handlePublish}
                      className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1 rounded-full transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Publicar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditContent(song.chordpro_content);
                      setEditing(!editing);
                    }}
                    className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1 rounded-full transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {editing ? "Cancelar" : "Editar"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1 rounded-full transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-4">
            <TransposeControls
              originalKey={originalKey}
              currentKey={currentKey}
              onChange={handleTransposeChange}
              notation={notation}
            />
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <FontSizeControls fontSize={fontSize} onChange={setFontSize} />
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <NotationToggle notation={notation} onChange={setNotation} />
          </div>
        </div>
      </header>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eliminar cancion
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Estas seguro de eliminar &quot;{song.title}&quot;? Esta accion no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chord chart content or editor */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {editing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[60vh] font-mono text-sm border border-gray-300 rounded-lg p-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <ChordChart
            content={song.chordpro_content}
            notation={notation}
            transpose={semitones}
            targetKey={targetKey}
            fontSize={fontSize}
          />
        )}
      </main>
    </div>
  );
}
