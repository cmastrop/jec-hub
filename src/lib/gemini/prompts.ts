export const CHORD_EXTRACTION_PROMPT = `You are a worship music chord chart expert. Analyze this image of a chord chart and extract the song information in ChordPro format.

Rules:
1. Identify the song title, artist (if visible), key, and tempo
2. Identify sections: Verse/Verso, Chorus/Coro, Bridge/Puente, Pre-Chorus/Pre-Coro, Intro, Outro
3. Place chords in square brackets [Chord] directly before the syllable they align with
4. Use LETTER notation for chords: C, D, E, F, G, A, B (NOT solfege Do, Re, Mi)
5. If the image uses solfege (Do, Re, Mi, Fa, Sol, La, Si), convert to letter notation
6. Use standard chord symbols: C, Cm, C7, Cmaj7, Csus4, C/E (slash chords), etc.
7. Preserve the original language of the lyrics (likely Spanish)
8. Use these section markers:
   - {start_of_verse: Verso 1} / {end_of_verse}
   - {start_of_chorus: Coro} / {end_of_chorus}
   - {start_of_bridge: Puente} / {end_of_bridge}
9. If you cannot read certain parts clearly, use {comment: [ilegible]} as placeholder
10. Include performance notes as {comment: note} (e.g., {comment: Repetir 2x})

Output ONLY valid ChordPro text starting with {title: ...}. No extra explanation.

Example output format:
{title: Song Name}
{artist: Artist Name}
{key: G}
{tempo: 120}
{time: 4/4}

{start_of_verse: Verso 1}
[G]First line of [C]lyrics [G]here
[Em]Second line [D]of lyrics
{end_of_verse}

{start_of_chorus: Coro}
[C]Chorus [G]lyrics [D]here
{end_of_chorus}`;

export const CHORD_EXTRACTION_PDF_PROMPT = `${CHORD_EXTRACTION_PROMPT}

Note: This is a PDF page. It may contain multiple songs or a single song across multiple pages. Extract what you can see on this page. If it's clearly a continuation of a song (no title visible), start with the sections directly.`;
