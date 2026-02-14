// Musical constants for JEC_HUB

export const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;

// Keys that conventionally use flats
export const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm"]);

// Keys that conventionally use sharps
export const SHARP_KEYS = new Set(["C", "G", "D", "A", "E", "B", "F#", "Am", "Em", "Bm", "F#m", "C#m", "G#m"]);

// Solfege <-> Letter mapping
export const SOLFEGE_TO_LETTER: Record<string, string> = {
  "Do": "C",
  "Re": "D",
  "Mi": "E",
  "Fa": "F",
  "Sol": "G",
  "La": "A",
  "Si": "B",
};

export const LETTER_TO_SOLFEGE: Record<string, string> = {
  "C": "Do",
  "D": "Re",
  "E": "Mi",
  "F": "Fa",
  "G": "Sol",
  "A": "La",
  "B": "Si",
};

// All 12 keys for selector
export const ALL_KEYS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];

// Major keys commonly used in worship
export const COMMON_KEYS = ["C", "D", "E", "F", "G", "A", "Bb", "Eb", "Ab"];

// Note name to semitone index
export function noteToSemitone(note: string): number {
  const sharpIndex = SHARPS.indexOf(note as typeof SHARPS[number]);
  if (sharpIndex !== -1) return sharpIndex;
  const flatIndex = FLATS.indexOf(note as typeof FLATS[number]);
  if (flatIndex !== -1) return flatIndex;
  return -1;
}

// Semitone index to note name
export function semitoneToNote(semitone: number, useFlats: boolean): string {
  const index = ((semitone % 12) + 12) % 12;
  return useFlats ? FLATS[index] : SHARPS[index];
}

// Check if a key conventionally uses flats
export function usesFlats(key: string): boolean {
  return FLAT_KEYS.has(key);
}
