export interface ChordProSong {
  metadata: SongMetadata;
  sections: Section[];
}

export interface SongMetadata {
  title: string;
  artist?: string;
  key?: string;
  tempo?: number;
  time?: string;
  capo?: number;
  [key: string]: string | number | undefined;
}

export type SectionType = "verse" | "chorus" | "bridge" | "precoro" | "intro" | "outro" | "interlude" | "tag" | "comment" | "unknown";

export interface Section {
  type: SectionType;
  label: string;
  lines: Line[];
}

export interface Line {
  segments: Segment[];
}

export interface Segment {
  chord?: string;
  text: string;
}

export type NotationMode = "letter" | "solfege";
