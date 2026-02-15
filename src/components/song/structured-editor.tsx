"use client";

import { useState, useCallback, useMemo } from "react";
import { parseChordPro } from "@/lib/chordpro/parser";
import { serializeChordPro } from "@/lib/chordpro/serializer";
import { ChordChart } from "./chord-chart";
import type { ChordProSong, Section, SectionType, NotationMode } from "@/lib/chordpro/types";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  X,
  Eye,
  EyeOff,
  Save,
  GripVertical,
  Music,
  Type,
} from "lucide-react";
import { ChordPositionEditor } from "./chord-position-editor";
import type { Line } from "@/lib/chordpro/types";

const SECTION_TYPES: { value: SectionType; label: string }[] = [
  { value: "intro", label: "Intro" },
  { value: "verse", label: "Verso" },
  { value: "precoro", label: "Pre-Coro" },
  { value: "chorus", label: "Coro" },
  { value: "bridge", label: "Puente" },
  { value: "interlude", label: "Instrumental" },
  { value: "outro", label: "Outro" },
  { value: "tag", label: "Tag" },
];

const SECTION_COLORS: Record<string, string> = {
  intro: "border-purple-300 bg-purple-50",
  verse: "border-blue-300 bg-blue-50",
  precoro: "border-amber-300 bg-amber-50",
  chorus: "border-green-300 bg-green-50",
  bridge: "border-orange-300 bg-orange-50",
  interlude: "border-pink-300 bg-pink-50",
  outro: "border-gray-300 bg-gray-50",
  tag: "border-cyan-300 bg-cyan-50",
  unknown: "border-gray-300 bg-gray-50",
  comment: "border-gray-200 bg-gray-50",
};

const SECTION_LABEL_COLORS: Record<string, string> = {
  intro: "text-purple-700",
  verse: "text-blue-700",
  precoro: "text-amber-700",
  chorus: "text-green-700",
  bridge: "text-orange-700",
  interlude: "text-pink-700",
  outro: "text-gray-700",
  tag: "text-cyan-700",
  unknown: "text-gray-700",
  comment: "text-gray-500",
};

/** Convert a Section back to raw ChordPro lines (just the content, no start/end directives) */
function sectionToRawLines(section: Section): string {
  return section.lines
    .map((line) =>
      line.segments
        .map((seg) => (seg.chord ? `[${seg.chord}]${seg.text}` : seg.text))
        .join("")
    )
    .join("\n");
}

/** Parse raw ChordPro lines back into a section's lines array */
function rawLinesToSection(raw: string): Section["lines"] {
  const CHORD_REGEX = /\[([^\]]*)\]/g;
  return raw.split("\n").map((text) => {
    const segments: { chord?: string; text: string }[] = [];
    let lastIndex = 0;
    let match;
    CHORD_REGEX.lastIndex = 0;
    while ((match = CHORD_REGEX.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (segments.length > 0) {
          segments[segments.length - 1].text += beforeText;
        } else {
          segments.push({ text: beforeText });
        }
      }
      segments.push({ chord: match[1], text: "" });
      lastIndex = CHORD_REGEX.lastIndex;
    }
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
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
  });
}

interface StructuredEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}

export function StructuredEditor({
  content,
  onChange,
  onSave,
  onCancel,
  saving,
}: StructuredEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [chordEditMode, setChordEditMode] = useState<"text" | "visual">("text");

  const song = useMemo(() => parseChordPro(content), [content]);

  const updateSong = useCallback(
    (updater: (s: ChordProSong) => ChordProSong) => {
      const current = parseChordPro(content);
      const updated = updater(current);
      onChange(serializeChordPro(updated));
    },
    [content, onChange]
  );

  // Metadata handlers
  const updateMetadata = useCallback(
    (field: string, value: string) => {
      updateSong((s) => ({
        ...s,
        metadata: {
          ...s.metadata,
          [field]: field === "tempo" || field === "capo" ? parseInt(value) || undefined : value || undefined,
        },
      }));
    },
    [updateSong]
  );

  // Section handlers
  const addSection = useCallback(
    (type: SectionType, label: string) => {
      updateSong((s) => ({
        ...s,
        sections: [
          ...s.sections,
          { type, label, lines: [{ segments: [{ text: "" }] }] },
        ],
      }));
      setShowAddMenu(false);
    },
    [updateSong]
  );

  const removeSection = useCallback(
    (index: number) => {
      updateSong((s) => ({
        ...s,
        sections: s.sections.filter((_, i) => i !== index),
      }));
    },
    [updateSong]
  );

  const moveSection = useCallback(
    (index: number, direction: "up" | "down") => {
      updateSong((s) => {
        const sections = [...s.sections];
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= sections.length) return s;
        [sections[index], sections[target]] = [sections[target], sections[index]];
        return { ...s, sections };
      });
    },
    [updateSong]
  );

  const updateSectionLabel = useCallback(
    (index: number, label: string) => {
      updateSong((s) => ({
        ...s,
        sections: s.sections.map((sec, i) =>
          i === index ? { ...sec, label } : sec
        ),
      }));
    },
    [updateSong]
  );

  const updateSectionType = useCallback(
    (index: number, type: SectionType) => {
      updateSong((s) => ({
        ...s,
        sections: s.sections.map((sec, i) =>
          i === index ? { ...sec, type } : sec
        ),
      }));
    },
    [updateSong]
  );

  const updateSectionContent = useCallback(
    (index: number, rawContent: string) => {
      updateSong((s) => ({
        ...s,
        sections: s.sections.map((sec, i) =>
          i === index ? { ...sec, lines: rawLinesToSection(rawContent) } : sec
        ),
      }));
    },
    [updateSong]
  );

  const updateSectionLine = useCallback(
    (sectionIndex: number, lineIndex: number, newLine: Line) => {
      updateSong((s) => ({
        ...s,
        sections: s.sections.map((sec, si) =>
          si === sectionIndex
            ? {
                ...sec,
                lines: sec.lines.map((l, li) => (li === lineIndex ? newLine : l)),
              }
            : sec
        ),
      }));
    },
    [updateSong]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showPreview ? "Ocultar vista previa" : "Vista previa"}
          </button>
          <button
            onClick={() => setChordEditMode(chordEditMode === "text" ? "visual" : "text")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              chordEditMode === "visual"
                ? "bg-primary/10 text-primary"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {chordEditMode === "visual" ? (
              <Type className="w-4 h-4" />
            ) : (
              <Music className="w-4 h-4" />
            )}
            {chordEditMode === "visual" ? "Modo Texto" : "Modo Acordes"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Layout: Editor + optional Preview */}
      <div className={showPreview ? "grid grid-cols-2 gap-6" : ""}>
        {/* Editor panel */}
        <div className="space-y-4">
          {/* Metadata */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Metadata
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Titulo</label>
                <input
                  type="text"
                  value={song.metadata.title}
                  onChange={(e) => updateMetadata("title", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Artista</label>
                <input
                  type="text"
                  value={song.metadata.artist || ""}
                  onChange={(e) => updateMetadata("artist", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Tonalidad</label>
                <input
                  type="text"
                  value={song.metadata.key || ""}
                  onChange={(e) => updateMetadata("key", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="C, Am, G..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Tempo (BPM)</label>
                <input
                  type="number"
                  value={song.metadata.tempo || ""}
                  onChange={(e) => updateMetadata("tempo", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Compas</label>
                <input
                  type="text"
                  value={song.metadata.time || ""}
                  onChange={(e) => updateMetadata("time", e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="4/4"
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          {song.sections.map((section, idx) => (
            <div
              key={idx}
              className={`border-2 rounded-lg overflow-hidden ${SECTION_COLORS[section.type] || SECTION_COLORS.unknown}`}
            >
              {/* Section header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-inherit">
                <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />

                {/* Section type selector */}
                <select
                  value={section.type}
                  onChange={(e) =>
                    updateSectionType(idx, e.target.value as SectionType)
                  }
                  className={`text-xs font-bold uppercase tracking-wider bg-transparent border-none focus:outline-none cursor-pointer ${SECTION_LABEL_COLORS[section.type] || SECTION_LABEL_COLORS.unknown}`}
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                {/* Section label (editable) */}
                {editingLabel === idx ? (
                  <input
                    type="text"
                    value={section.label}
                    onChange={(e) => updateSectionLabel(idx, e.target.value)}
                    onBlur={() => setEditingLabel(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditingLabel(null);
                    }}
                    autoFocus
                    className="text-sm px-2 py-0.5 border border-gray-300 rounded bg-white focus:border-primary focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => setEditingLabel(idx)}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    title="Click para editar nombre"
                  >
                    {section.label || "(sin nombre)"}
                  </button>
                )}

                <div className="flex-1" />

                {/* Move buttons */}
                <button
                  onClick={() => moveSection(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-white/50 disabled:opacity-30 transition-colors"
                  title="Mover arriba"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveSection(idx, "down")}
                  disabled={idx === song.sections.length - 1}
                  className="p-1 rounded hover:bg-white/50 disabled:opacity-30 transition-colors"
                  title="Mover abajo"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Remove button */}
                <button
                  onClick={() => removeSection(idx)}
                  className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar seccion"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Section content */}
              {chordEditMode === "visual" ? (
                <div className="p-2 space-y-0.5 bg-white/50">
                  {section.lines.map((lineItem, lineIdx) => (
                    <ChordPositionEditor
                      key={lineIdx}
                      line={lineItem}
                      onChange={(newLine) => updateSectionLine(idx, lineIdx, newLine)}
                    />
                  ))}
                </div>
              ) : (
                <textarea
                  value={sectionToRawLines(section)}
                  onChange={(e) => updateSectionContent(idx, e.target.value)}
                  rows={Math.max(
                    2,
                    sectionToRawLines(section).split("\n").length + 1
                  )}
                  className="w-full font-mono text-sm p-3 bg-white/50 border-0 focus:outline-none focus:ring-0 resize-none"
                  placeholder="[G]Letra con [Am]acordes..."
                />
              )}
            </div>
          ))}

          {/* Add section button */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar seccion
            </button>
            {showAddMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                {SECTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => addSection(t.value, t.label)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-y-auto max-h-[80vh] sticky top-24">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Vista Previa
            </h3>
            <ChordChart content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
