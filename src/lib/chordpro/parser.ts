import type { ChordProSong, SongMetadata, Section, SectionType, Line, Segment } from "./types";

const DIRECTIVE_REGEX = /^\{([^:}]+)(?::?\s*(.+))?\}$/;
const CHORD_REGEX = /\[([^\]]*)\]/g;

const SECTION_START_MAP: Record<string, SectionType> = {
  "start_of_verse": "verse",
  "sov": "verse",
  "start_of_chorus": "chorus",
  "soc": "chorus",
  "start_of_bridge": "bridge",
  "sob": "bridge",
  "start_of_tab": "intro",
  "sot": "intro",
};

const SECTION_END_DIRECTIVES = new Set([
  "end_of_verse", "eov",
  "end_of_chorus", "eoc",
  "end_of_bridge", "eob",
  "end_of_tab", "eot",
]);

const METADATA_DIRECTIVES = new Set([
  "title", "t",
  "subtitle", "st",
  "artist",
  "key",
  "tempo",
  "time",
  "capo",
]);

function inferSectionType(label: string): SectionType {
  const lower = label.toLowerCase();
  if (lower.includes("verso") || lower.includes("verse") || lower.match(/^v\d/)) return "verse";
  if (lower.includes("coro") || lower.includes("chorus")) return "chorus";
  if (lower.includes("puente") || lower.includes("bridge")) return "bridge";
  if (lower.includes("pre-coro") || lower.includes("pre coro") || lower.includes("precoro") || lower.includes("pre-chorus")) return "precoro";
  if (lower.includes("intro")) return "intro";
  if (lower.includes("outro") || lower.includes("final")) return "outro";
  if (lower.includes("interludio") || lower.includes("interlude")) return "interlude";
  if (lower.includes("tag") || lower.includes("coda")) return "tag";
  return "unknown";
}

/** Check if a line has chords but only whitespace/empty text */
function isChordOnlyLine(line: Line): boolean {
  if (!line.segments.some(s => s.chord)) return false;
  return line.segments.every(s => !s.text || s.text.trim() === "");
}

/** Check if a line has no chords at all */
function isTextOnlyLine(line: Line): boolean {
  return line.segments.every(s => !s.chord) && line.segments.some(s => s.text.trim() !== "");
}

/** Merge a chord-only line with the text-only line below it */
function mergeChordAndTextLines(chordLine: Line, textLine: Line): Line {
  // Compute character position of each chord in the chord-only line
  const chordPositions: { chord: string; position: number }[] = [];
  let pos = 0;
  for (const seg of chordLine.segments) {
    if (seg.chord) {
      chordPositions.push({ chord: seg.chord, position: pos });
    }
    pos += (seg.text || "").length;
  }

  // Get the full lyrics text
  const fullText = textLine.segments.map(s => s.text).join("");

  chordPositions.sort((a, b) => a.position - b.position);

  const segments: Segment[] = [];
  let lastPos = 0;

  for (const cp of chordPositions) {
    const clampedPos = Math.min(cp.position, fullText.length);
    if (clampedPos > lastPos) {
      const textBefore = fullText.slice(lastPos, clampedPos);
      if (segments.length > 0) {
        segments[segments.length - 1].text += textBefore;
      } else {
        segments.push({ text: textBefore });
      }
    }
    segments.push({ chord: cp.chord, text: "" });
    lastPos = clampedPos;
  }

  const remaining = fullText.slice(lastPos);
  if (remaining) {
    if (segments.length > 0) {
      segments[segments.length - 1].text += remaining;
    } else {
      segments.push({ text: remaining });
    }
  }

  if (segments.length === 0) {
    segments.push({ text: "" });
  }

  return { segments };
}

/** Post-process section lines: merge chord-only + text-only consecutive pairs */
function postProcessLines(lines: Line[]): Line[] {
  const result: Line[] = [];
  let i = 0;
  while (i < lines.length) {
    if (i + 1 < lines.length && isChordOnlyLine(lines[i]) && isTextOnlyLine(lines[i + 1])) {
      result.push(mergeChordAndTextLines(lines[i], lines[i + 1]));
      i += 2; // skip both lines
    } else {
      result.push(lines[i]);
      i++;
    }
  }
  return result;
}

function parseLine(text: string): Line {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match;

  CHORD_REGEX.lastIndex = 0;
  while ((match = CHORD_REGEX.exec(text)) !== null) {
    // Text before this chord (belongs to previous segment or is a text-only segment)
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      if (segments.length > 0) {
        segments[segments.length - 1].text += beforeText;
      } else {
        segments.push({ text: beforeText });
      }
    }
    // Start new segment with this chord
    segments.push({ chord: match[1], text: "" });
    lastIndex = CHORD_REGEX.lastIndex;
  }

  // Remaining text after last chord
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (segments.length > 0) {
      segments[segments.length - 1].text += remaining;
    } else {
      segments.push({ text: remaining });
    }
  }

  // If no segments at all (empty line), add empty segment
  if (segments.length === 0) {
    segments.push({ text: "" });
  }

  return { segments };
}

export function parseChordPro(input: string): ChordProSong {
  const lines = input.split(/\r?\n/);
  const metadata: SongMetadata = { title: "Sin título" };
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Empty line
    if (line === "") {
      if (currentSection && currentSection.lines.length > 0) {
        currentSection.lines.push({ segments: [{ text: "" }] });
      }
      continue;
    }

    // Directive line
    const directiveMatch = line.match(DIRECTIVE_REGEX);
    if (directiveMatch) {
      const [, directive, value] = directiveMatch;
      const directiveLower = directive.trim().toLowerCase();

      // Metadata directives
      if (METADATA_DIRECTIVES.has(directiveLower)) {
        const val = (value || "").trim();
        switch (directiveLower) {
          case "title": case "t":
            metadata.title = val;
            break;
          case "subtitle": case "st":
            metadata.artist = metadata.artist || val;
            break;
          case "artist":
            metadata.artist = val;
            break;
          case "key":
            metadata.key = val;
            break;
          case "tempo":
            metadata.tempo = parseInt(val) || undefined;
            break;
          case "time":
            metadata.time = val;
            break;
          case "capo":
            metadata.capo = parseInt(val) || 0;
            break;
        }
        continue;
      }

      // Section start
      if (SECTION_START_MAP[directiveLower]) {
        if (currentSection) sections.push(currentSection);
        const sectionType = SECTION_START_MAP[directiveLower];
        currentSection = {
          type: sectionType,
          label: (value || sectionType).trim(),
          lines: [],
        };
        continue;
      }

      // Section end
      if (SECTION_END_DIRECTIVES.has(directiveLower)) {
        if (currentSection) {
          sections.push(currentSection);
          currentSection = null;
        }
        continue;
      }

      // Comment directive
      if (directiveLower === "comment" || directiveLower === "c") {
        if (!currentSection) {
          currentSection = { type: "unknown", label: "", lines: [] };
        }
        currentSection.lines.push({
          segments: [{ text: `⚡ ${(value || "").trim()}` }],
        });
        continue;
      }

      // Unknown directive - try to infer section
      if (value) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: inferSectionType(directive),
          label: (value || directive).trim(),
          lines: [],
        };
      }
      continue;
    }

    // Regular line (lyrics + chords)
    if (!currentSection) {
      currentSection = { type: "unknown", label: "", lines: [] };
    }
    currentSection.lines.push(parseLine(line));
  }

  // Push last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // Post-process: merge chord-only + text-only line pairs
  for (const section of sections) {
    section.lines = postProcessLines(section.lines);
  }

  return { metadata, sections };
}
