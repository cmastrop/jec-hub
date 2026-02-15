import type { Line } from "./types";

export interface ChordPosition {
  chord: string;
  position: number;
}

export interface LinePositions {
  text: string;
  chords: ChordPosition[];
}

/**
 * Flatten a Line's segments into plain text + an array of chord positions.
 * e.g., [{ chord: "Am", text: "Hola " }, { chord: "G", text: "mundo" }]
 *   -> { text: "Hola mundo", chords: [{ chord: "Am", position: 0 }, { chord: "G", position: 5 }] }
 */
export function lineToPositions(line: Line): LinePositions {
  let text = "";
  const chords: ChordPosition[] = [];

  for (const seg of line.segments) {
    if (seg.chord) {
      chords.push({ chord: seg.chord, position: text.length });
    }
    text += seg.text;
  }

  return { text, chords };
}

/**
 * Rebuild a Line from plain text + chord positions.
 * Inverse of lineToPositions.
 */
export function positionsToLine(
  text: string,
  chords: ChordPosition[]
): Line {
  if (chords.length === 0) {
    return { segments: [{ text }] };
  }

  // Sort chords by position
  const sorted = [...chords].sort((a, b) => a.position - b.position);
  const segments: { chord?: string; text: string }[] = [];

  let lastPos = 0;

  for (const cp of sorted) {
    // Text before this chord (belongs to previous segment or standalone)
    if (cp.position > lastPos) {
      const beforeText = text.slice(lastPos, cp.position);
      if (segments.length > 0 && !segments[segments.length - 1].chord) {
        segments[segments.length - 1].text += beforeText;
      } else if (segments.length > 0) {
        segments[segments.length - 1].text += beforeText;
      } else {
        segments.push({ text: beforeText });
      }
    }

    segments.push({ chord: cp.chord, text: "" });
    lastPos = cp.position;
  }

  // Remaining text after last chord
  if (lastPos < text.length) {
    const remaining = text.slice(lastPos);
    if (segments.length > 0) {
      segments[segments.length - 1].text += remaining;
    } else {
      segments.push({ text: remaining });
    }
  }

  // Ensure at least one segment
  if (segments.length === 0) {
    segments.push({ text: "" });
  }

  return { segments };
}

/**
 * Move a chord at the given index by `delta` characters.
 * Clamps to [0, textLength]. Prevents overlapping positions.
 */
export function moveChord(
  chords: ChordPosition[],
  chordIndex: number,
  delta: number,
  textLength: number
): ChordPosition[] {
  if (chordIndex < 0 || chordIndex >= chords.length) return chords;

  const newChords = chords.map((c) => ({ ...c }));
  const newPos = Math.max(0, Math.min(textLength, newChords[chordIndex].position + delta));

  // Check for collision with another chord at the target position
  const hasCollision = newChords.some(
    (c, i) => i !== chordIndex && c.position === newPos
  );
  if (hasCollision) return chords;

  newChords[chordIndex].position = newPos;
  return newChords;
}

/**
 * Add a chord at a given position. Returns new array.
 */
export function addChord(
  chords: ChordPosition[],
  chord: string,
  position: number
): ChordPosition[] {
  // Prevent adding at a position that already has a chord
  if (chords.some((c) => c.position === position)) return chords;
  return [...chords, { chord, position }].sort((a, b) => a.position - b.position);
}

/**
 * Remove a chord at the given index. Returns new array.
 */
export function removeChord(
  chords: ChordPosition[],
  chordIndex: number
): ChordPosition[] {
  return chords.filter((_, i) => i !== chordIndex);
}
