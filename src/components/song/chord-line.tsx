"use client";

import type { Line, NotationMode } from "@/lib/chordpro/types";
import { transposeChord, convertNotation } from "@/lib/chordpro/transpose";

interface ChordLineProps {
  line: Line;
  notation: NotationMode;
  semitones: number;
  targetKey?: string;
}

export function ChordLine({ line, notation, semitones, targetKey }: ChordLineProps) {
  const hasAnyChord = line.segments.some((seg) => seg.chord);

  // Empty line (spacer)
  if (line.segments.length === 1 && !line.segments[0].chord && line.segments[0].text === "") {
    return <div className="h-4" />;
  }

  return (
    <div className="flex flex-wrap items-end leading-normal">
      {line.segments.map((segment, i) => {
        let displayChord = segment.chord || "";

        if (displayChord) {
          // Apply transposition first (works on letter notation)
          if (semitones !== 0) {
            displayChord = transposeChord(displayChord, semitones, targetKey);
          }
          // Then convert notation if needed
          if (notation === "solfege") {
            displayChord = convertNotation(displayChord, "solfege");
          }
        }

        return (
          <span key={i} className="inline-flex flex-col align-bottom">
            {hasAnyChord && (
              <span
                className="chord whitespace-pre min-h-[1.2em] leading-tight"
                aria-label={displayChord ? `Acorde: ${displayChord}` : undefined}
              >
                {displayChord || "\u00A0"}
              </span>
            )}
            <span className="whitespace-pre-wrap">
              {segment.text || (segment.chord ? "\u00A0" : "")}
            </span>
          </span>
        );
      })}
    </div>
  );
}
