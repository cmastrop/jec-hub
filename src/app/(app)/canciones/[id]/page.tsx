"use client";

import { useState, useMemo } from "react";
import { ChordChart } from "@/components/song/chord-chart";
import { TransposeControls } from "@/components/song/transpose-controls";
import { FontSizeControls } from "@/components/song/font-size-controls";
import { NotationToggle } from "@/components/song/notation-toggle";
import { getKeyFromSemitoneOffset } from "@/lib/chordpro/transpose";
import type { NotationMode } from "@/lib/chordpro/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const DEMO_CHORDPRO = `{title: Grande Es Tu Fidelidad}
{artist: Himno Clasico}
{key: G}
{tempo: 72}
{time: 4/4}

{start_of_verse: Verso 1}
[G]Grande es tu fi[C]deli[G]dad, oh [Em]Dios mi [D]Padre
[G]No hay som[B7]bra de va[Em]riacion en [A7]Ti [D]
[G]Tu com[C]pasion no [Bm]cambia [Em]
[Am]Grande es [D]tu [G]fidelidad
{end_of_verse}

{start_of_chorus: Coro}
[G]Grande es tu fi[C]deli[G]dad
[G]Grande es tu fi[C]deli[G]dad
[Em]Cada ma[Bm]nana las [C]misericor[D]dias
[Em]Nuevas [C]son, [D]grande es tu [G]fideli[C]dad [G]
{end_of_chorus}

{start_of_bridge: Puente}
[C]Tu compasion no se a[G]gota
[Am]Nueva es cada [D]manana
{end_of_bridge}`;

const ORIGINAL_KEY = "G";

export default function SongDetailPage() {
  const [semitones, setSemitones] = useState(0);
  const [targetKey, setTargetKey] = useState(ORIGINAL_KEY);
  const [fontSize, setFontSize] = useState(18);
  const [notation, setNotation] = useState<NotationMode>("letter");

  const currentKey = useMemo(
    () => getKeyFromSemitoneOffset(ORIGINAL_KEY, semitones),
    [semitones]
  );

  const handleTransposeChange = (newSemitones: number, newTargetKey: string) => {
    setSemitones(newSemitones);
    setTargetKey(newTargetKey);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href="/canciones"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a canciones
          </Link>

          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-4">
            <TransposeControls
              originalKey={ORIGINAL_KEY}
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
          content={DEMO_CHORDPRO}
          notation={notation}
          transpose={semitones}
          targetKey={targetKey}
          fontSize={fontSize}
        />
      </main>
    </div>
  );
}
