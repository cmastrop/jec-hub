import { SHARPS, FLATS, FLAT_KEYS, SOLFEGE_TO_LETTER, LETTER_TO_SOLFEGE } from "../utils/keys";
import type { NotationMode } from "./types";

// Regex to parse a chord: root note + optional accidental + optional quality/extensions + optional bass
const CHORD_PARSE_REGEX = /^([A-G])([#b]?)(.*)$/;
const SOLFEGE_PARSE_REGEX = /^(Do|Re|Mi|Fa|Sol|La|Si)([#b]?)(.*)$/;
const BASS_REGEX = /^(.+)\/([A-G][#b]?)$/;
const SOLFEGE_BASS_REGEX = /^(.+)\/(Do|Re|Mi|Fa|Sol|La|Si)([#b]?)$/;

function noteToIndex(note: string): number {
  const idx = SHARPS.indexOf(note as (typeof SHARPS)[number]);
  if (idx !== -1) return idx;
  return FLATS.indexOf(note as (typeof FLATS)[number]);
}

function indexToNote(index: number, useFlats: boolean): string {
  const i = ((index % 12) + 12) % 12;
  return useFlats ? FLATS[i] : SHARPS[i];
}

/**
 * Convert a solfege chord root to letter notation
 * e.g., "Sol" -> "G", "Do#" -> "C#"
 */
export function solfegeToLetter(chord: string): string {
  // Handle bass note
  const solBassMatch = chord.match(SOLFEGE_BASS_REGEX);
  if (solBassMatch) {
    const [, mainPart, bassRoot, bassAcc] = solBassMatch;
    const convertedMain = solfegeToLetter(mainPart);
    const bassLetter = SOLFEGE_TO_LETTER[bassRoot];
    if (bassLetter) {
      return `${convertedMain}/${bassLetter}${bassAcc}`;
    }
  }

  const match = chord.match(SOLFEGE_PARSE_REGEX);
  if (!match) return chord;
  const [, root, accidental, quality] = match;
  const letter = SOLFEGE_TO_LETTER[root];
  if (!letter) return chord;
  return `${letter}${accidental}${quality}`;
}

/**
 * Convert a letter chord root to solfege notation
 * e.g., "G" -> "Sol", "C#m7" -> "Do#m7"
 */
export function letterToSolfege(chord: string): string {
  // Handle bass note
  const bassMatch = chord.match(BASS_REGEX);
  if (bassMatch) {
    const [, mainPart, bassNote] = bassMatch;
    const convertedMain = letterToSolfege(mainPart);
    const bassMatch2 = bassNote.match(CHORD_PARSE_REGEX);
    if (bassMatch2) {
      const [, bassRoot, bassAcc] = bassMatch2;
      const bassSolfege = LETTER_TO_SOLFEGE[bassRoot];
      if (bassSolfege) {
        return `${convertedMain}/${bassSolfege}${bassAcc}`;
      }
    }
  }

  const match = chord.match(CHORD_PARSE_REGEX);
  if (!match) return chord;
  const [, root, accidental, quality] = match;
  const solfege = LETTER_TO_SOLFEGE[root];
  if (!solfege) return chord;
  return `${solfege}${accidental}${quality}`;
}

/**
 * Transpose a single chord by a number of semitones
 */
export function transposeChord(chord: string, semitones: number, targetKey?: string): string {
  if (semitones === 0) return chord;

  const useFlats = targetKey ? FLAT_KEYS.has(targetKey) : false;

  // Handle bass note first
  const bassMatch = chord.match(BASS_REGEX);
  if (bassMatch) {
    const [, mainPart, bassNote] = bassMatch;
    return `${transposeChord(mainPart, semitones, targetKey)}/${transposeChord(bassNote, semitones, targetKey)}`;
  }

  const match = chord.match(CHORD_PARSE_REGEX);
  if (!match) return chord;

  const [, root, accidental, quality] = match;
  const noteStr = `${root}${accidental}`;
  const index = noteToIndex(noteStr);
  if (index === -1) return chord;

  const newIndex = ((index + semitones) % 12 + 12) % 12;
  const newNote = indexToNote(newIndex, useFlats);
  return `${newNote}${quality}`;
}

/**
 * Get semitones between two keys
 */
export function getSemitonesBetweenKeys(fromKey: string, toKey: string): number {
  const fromIndex = noteToIndex(fromKey.replace(/m$/, ""));
  const toIndex = noteToIndex(toKey.replace(/m$/, ""));
  if (fromIndex === -1 || toIndex === -1) return 0;
  return ((toIndex - fromIndex) % 12 + 12) % 12;
}

/**
 * Get the target key after transposing by semitones
 */
export function getKeyFromSemitoneOffset(originalKey: string, semitones: number): string {
  const isMinor = originalKey.endsWith("m");
  const root = isMinor ? originalKey.slice(0, -1) : originalKey;
  const index = noteToIndex(root);
  if (index === -1) return originalKey;

  const newIndex = ((index + semitones) % 12 + 12) % 12;
  const useFlats = FLAT_KEYS.has(originalKey);
  const newNote = indexToNote(newIndex, useFlats);
  return isMinor ? `${newNote}m` : newNote;
}

/**
 * Convert a chord to the specified notation mode
 */
export function convertNotation(chord: string, mode: NotationMode): string {
  if (mode === "solfege") return letterToSolfege(chord);
  return chord; // already in letter notation (storage format)
}

/**
 * Transpose all chords in a ChordPro content string
 */
export function transposeChordProContent(content: string, semitones: number, targetKey?: string): string {
  if (semitones === 0) return content;
  return content.replace(/\[([^\]]+)\]/g, (match, chord) => {
    return `[${transposeChord(chord, semitones, targetKey)}]`;
  });
}
