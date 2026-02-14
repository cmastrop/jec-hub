"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChordChart } from "@/components/song/chord-chart";
import { TransposeControls } from "@/components/song/transpose-controls";
import { FontSizeControls } from "@/components/song/font-size-controls";
import { NotationToggle } from "@/components/song/notation-toggle";
import { getKeyFromSemitoneOffset } from "@/lib/chordpro/transpose";
import type { NotationMode } from "@/lib/chordpro/types";
import type { Song } from "@/lib/types/database";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SongDetailPage() {
  const params = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semitones, setSemitones] = useState(0);
  const [targetKey, setTargetKey] = useState("");
  const [fontSize, setFontSize] = useState(18);
  const [notation, setNotation] = useState<NotationMode>("letter");

  useEffect(() => {
    async function loadSong() {
      try {
        const res = await fetch(`/api/songs/${params.id}`);
        if (!res.ok) {
          setError("Canción no encontrada");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSong(data);
        setTargetKey(data.original_key || "C");
      } catch {
        setError("Error al cargar la canción");
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
          {error || "Canción no encontrada"}
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
            {song.status === "draft" && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                Borrador
              </span>
            )}
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

      {/* Chord chart content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ChordChart
          content={song.chordpro_content}
          notation={notation}
          transpose={semitones}
          targetKey={targetKey}
          fontSize={fontSize}
        />
      </main>
    </div>
  );
}
