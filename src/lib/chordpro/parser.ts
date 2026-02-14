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

  return { metadata, sections };
}
