"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChordChart } from "@/components/song/chord-chart";
import { StructuredEditor } from "@/components/song/structured-editor";
import { TransposeControls } from "@/components/song/transpose-controls";
import { FontSizeControls } from "@/components/song/font-size-controls";
import { NotationToggle } from "@/components/song/notation-toggle";
import { getKeyFromSemitoneOffset } from "@/lib/chordpro/transpose";
import { useUser } from "@/hooks/use-user";
import type { NotationMode } from "@/lib/chordpro/types";
import type { Song } from "@/lib/types/database";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  CheckCircle,
  Pencil,
  Image as ImageIcon,
  X,
} from "lucide-react";


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
  const [chordFontSize, setChordFontSize] = useState(16);
  const [notation, setNotation] = useState<NotationMode>("letter");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Original image viewer
  const [showOriginal, setShowOriginal] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [loadingOriginal, setLoadingOriginal] = useState(false);

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

  const handleSaveEdit = useCallback(async () => {
    setSaving(true);
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
    setSaving(false);
  }, [params.id, editContent]);

  async function handleShowOriginal() {
    if (showOriginal) {
      setShowOriginal(false);
      return;
    }
    setLoadingOriginal(true);
    try {
      const res = await fetch(`/api/songs/${params.id}/original`);
      if (res.ok) {
        const data = await res.json();
        setOriginalUrl(data.url);
        setShowOriginal(true);
      }
    } catch {
      // ignore
    }
    setLoadingOriginal(false);
  }

  const hasOriginal = song?.original_file_url;
  const originalExt = song?.original_file_url
    ?.split(".")
    .pop()
    ?.toLowerCase();
  const isPdf = originalExt === "pdf";

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
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline text-sm"
        >
          Volver a canciones
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <div className="flex items-center gap-2">
              {song.status === "draft" && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  Borrador
                </span>
              )}
              {isAdmin && (
                <>
                  {hasOriginal && (
                    <button
                      onClick={handleShowOriginal}
                      disabled={loadingOriginal}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${
                        showOriginal
                          ? "bg-purple-200 text-purple-800"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {loadingOriginal ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                      {showOriginal ? "Ocultar Original" : "Ver Original"}
                    </button>
                  )}
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
                      if (editing) {
                        setEditing(false);
                      } else {
                        setEditContent(song.chordpro_content);
                        setEditing(true);
                      }
                    }}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors ${
                      editing
                        ? "bg-blue-200 text-blue-800"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
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

          {/* Controls bar - only show when not editing */}
          {!editing && (
            <div className="flex flex-wrap items-center gap-4">
              <TransposeControls
                originalKey={originalKey}
                currentKey={currentKey}
                onChange={handleTransposeChange}
                notation={notation}
              />
              <div className="hidden sm:block w-px h-8 bg-gray-200" />
              <FontSizeControls
                fontSize={fontSize}
                chordFontSize={chordFontSize}
                onFontSizeChange={setFontSize}
                onChordFontSizeChange={setChordFontSize}
              />
              <div className="hidden sm:block w-px h-8 bg-gray-200" />
              <NotationToggle notation={notation} onChange={setNotation} />
            </div>
          )}
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
              Estas seguro de eliminar &quot;{song.title}&quot;? Esta accion no
              se puede deshacer.
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

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div
          className={
            showOriginal && !editing
              ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
              : ""
          }
        >
          {/* Chord chart / editor */}
          <div className={!showOriginal || editing ? "max-w-4xl mx-auto" : ""}>
            {editing ? (
              <StructuredEditor
                content={editContent}
                onChange={setEditContent}
                onSave={handleSaveEdit}
                onCancel={() => setEditing(false)}
                saving={saving}
              />
            ) : (
              <ChordChart
                content={song.chordpro_content}
                notation={notation}
                transpose={semitones}
                targetKey={targetKey}
                fontSize={fontSize}
                chordFontSize={chordFontSize}
              />
            )}
          </div>

          {/* Original image panel */}
          {showOriginal && !editing && originalUrl && (
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-600">
                  Archivo Original
                </h3>
                <button
                  onClick={() => setShowOriginal(false)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="p-2">
                {isPdf ? (
                  <iframe
                    src={originalUrl}
                    className="w-full h-[80vh] rounded"
                    title="Archivo original"
                  />
                ) : (
                  <img
                    src={originalUrl}
                    alt="Archivo original"
                    className="w-full h-auto rounded"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
