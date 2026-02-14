import type { ChordProSong, Section, Line } from "./types";

function serializeLine(line: Line): string {
  return line.segments
    .map((seg) => {
      if (seg.chord) {
        return `[${seg.chord}]${seg.text}`;
      }
      return seg.text;
    })
    .join("");
}

function serializeSection(section: Section): string {
  const lines: string[] = [];

  const typeMap: Record<string, string> = {
    verse: "verse",
    chorus: "chorus",
    bridge: "bridge",
    precoro: "verse",
    intro: "tab",
    outro: "tab",
    interlude: "tab",
    tag: "verse",
  };

  const chordProType = typeMap[section.type] || "verse";

  if (section.type !== "unknown" && section.type !== "comment") {
    lines.push(`{start_of_${chordProType}: ${section.label}}`);
  }

  for (const line of section.lines) {
    lines.push(serializeLine(line));
  }

  if (section.type !== "unknown" && section.type !== "comment") {
    lines.push(`{end_of_${chordProType}}`);
  }

  return lines.join("\n");
}

export function serializeChordPro(song: ChordProSong): string {
  const lines: string[] = [];

  // Metadata
  lines.push(`{title: ${song.metadata.title}}`);
  if (song.metadata.artist) lines.push(`{artist: ${song.metadata.artist}}`);
  if (song.metadata.key) lines.push(`{key: ${song.metadata.key}}`);
  if (song.metadata.tempo) lines.push(`{tempo: ${song.metadata.tempo}}`);
  if (song.metadata.time) lines.push(`{time: ${song.metadata.time}}`);
  if (song.metadata.capo) lines.push(`{capo: ${song.metadata.capo}}`);
  lines.push("");

  // Sections
  for (const section of song.sections) {
    lines.push(serializeSection(section));
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}
