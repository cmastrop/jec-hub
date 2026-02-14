"use client";

import { useMemo } from "react";
import { parseChordPro } from "@/lib/chordpro/parser";
import { convertNotation, getKeyFromSemitoneOffset } from "@/lib/chordpro/transpose";
import type { NotationMode } from "@/lib/chordpro/types";
import { SectionHeader } from "./section-header";
import { ChordLine } from "./chord-line";
import { Music, Clock, Hash } from "lucide-react";

interface ChordChartProps {
  content: string;
  notation?: NotationMode;
  transpose?: number;
  targetKey?: string;
  fontSize?: number;
}

export function ChordChart({
  content,
  notation = "letter",
  transpose = 0,
  targetKey,
  fontSize = 18,
}: ChordChartProps) {
  const song = useMemo(() => parseChordPro(content), [content]);

  const chordFontSize = fontSize - 2;

  // Compute the displayed key
  const displayKey = useMemo(() => {
    if (!song.metadata.key) return undefined;
    let key = song.metadata.key;
    if (transpose !== 0) {
      key = getKeyFromSemitoneOffset(key, transpose);
    }
    if (notation === "solfege") {
      key = convertNotation(key, "solfege");
    }
    return key;
  }, [song.metadata.key, transpose, notation]);

  const originalKeyDisplay = useMemo(() => {
    if (!song.metadata.key) return undefined;
    if (notation === "solfege") {
      return convertNotation(song.metadata.key, "solfege");
    }
    return song.metadata.key;
  }, [song.metadata.key, notation]);

  return (
    <div
      className="chord-chart max-w-3xl mx-auto"
      style={{
        "--lyrics-font-size": `${fontSize}px`,
        "--chord-font-size": `${chordFontSize}px`,
      } as React.CSSProperties}
    >
      {/* Title & Artist */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {song.metadata.title}
        </h1>
        {song.metadata.artist && (
          <p className="text-base text-gray-500 mt-1">
            {song.metadata.artist}
          </p>
        )}
      </div>

      {/* Metadata bar: Key, Tempo, Time */}
      {(song.metadata.key || song.metadata.tempo || song.metadata.time) && (
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 border-y border-gray-200 py-3">
          {displayKey && (
            <div className="flex items-center gap-1.5">
              <Music className="w-4 h-4" />
              <span className="font-medium">Tono:</span>
              <span className="font-bold text-foreground">{displayKey}</span>
              {transpose !== 0 && originalKeyDisplay && (
                <span className="text-gray-400 text-xs ml-1">
                  (orig. {originalKeyDisplay})
                </span>
              )}
            </div>
          )}
          {song.metadata.tempo && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Tempo:</span>
              <span className="font-bold text-foreground">
                {song.metadata.tempo} BPM
              </span>
            </div>
          )}
          {song.metadata.time && (
            <div className="flex items-center gap-1.5">
              <Hash className="w-4 h-4" />
              <span className="font-medium">Compas:</span>
              <span className="font-bold text-foreground">
                {song.metadata.time}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-2">
        {song.sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.label && (
              <SectionHeader type={section.type} label={section.label} />
            )}
            <div className="pl-4">
              {section.lines.map((line, lIdx) => (
                <ChordLine
                  key={lIdx}
                  line={line}
                  notation={notation}
                  semitones={transpose}
                  targetKey={targetKey}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
