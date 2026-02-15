"use client";

import { useState, useCallback, useRef } from "react";
import type { Line } from "@/lib/chordpro/types";
import {
  lineToPositions,
  positionsToLine,
  moveChord,
  addChord,
  removeChord,
  type ChordPosition,
} from "@/lib/chordpro/chord-position";
import { ChevronLeft, ChevronRight, X, Plus, Pencil } from "lucide-react";

interface ChordPositionEditorProps {
  line: Line;
  onChange: (newLine: Line) => void;
}

export function ChordPositionEditor({ line, onChange }: ChordPositionEditorProps) {
  const [selectedChord, setSelectedChord] = useState<number | null>(null);
  const [addingChord, setAddingChord] = useState(false);
  const [newChordName, setNewChordName] = useState("");
  const [newChordPos, setNewChordPos] = useState<number | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [editText, setEditText] = useState("");
  const chordInputRef = useRef<HTMLInputElement>(null);

  const { text, chords } = lineToPositions(line);

  // Empty line = spacer
  const isEmpty = text.trim() === "" && chords.length === 0;
  if (isEmpty) {
    return <div className="h-4" />;
  }

  const handleMove = (index: number, delta: number) => {
    const newChords = moveChord(chords, index, delta, text.length);
    onChange(positionsToLine(text, newChords));
  };

  const handleRemove = (index: number) => {
    const newChords = removeChord(chords, index);
    onChange(positionsToLine(text, newChords));
    setSelectedChord(null);
  };

  const handleAddStart = () => {
    setAddingChord(true);
    setNewChordName("");
    setNewChordPos(null);
    setSelectedChord(null);
  };

  const handleCharClick = (pos: number) => {
    if (addingChord) {
      setNewChordPos(pos);
      setTimeout(() => chordInputRef.current?.focus(), 0);
    }
  };

  const handleAddConfirm = () => {
    if (newChordName.trim() && newChordPos !== null) {
      const newChords = addChord(chords, newChordName.trim(), newChordPos);
      onChange(positionsToLine(text, newChords));
    }
    setAddingChord(false);
    setNewChordName("");
    setNewChordPos(null);
  };

  const handleAddCancel = () => {
    setAddingChord(false);
    setNewChordName("");
    setNewChordPos(null);
  };

  const handleEditText = () => {
    setEditingText(true);
    setEditText(text);
    setSelectedChord(null);
    setAddingChord(false);
  };

  const handleSaveText = () => {
    // Rebuild line with new text, keeping chords at their positions (clamped)
    const clamped: ChordPosition[] = chords.map((c) => ({
      ...c,
      position: Math.min(c.position, editText.length),
    }));
    onChange(positionsToLine(editText, clamped));
    setEditingText(false);
  };

  // Build a map of position -> chord for quick lookup
  const chordMap = new Map<number, { chord: string; index: number }>();
  chords.forEach((c, i) => chordMap.set(c.position, { chord: c.chord, index: i }));

  return (
    <div className="group relative py-1.5 px-2 rounded hover:bg-white/80 transition-colors">
      {/* Chord row */}
      <div className="flex font-mono text-xs leading-none h-5" style={{ letterSpacing: "0ch" }}>
        {text.split("").map((_, i) => {
          const entry = chordMap.get(i);
          return (
            <span
              key={`c${i}`}
              className="inline-block"
              style={{ width: "1ch" }}
            >
              {entry && (
                <button
                  onClick={() => setSelectedChord(selectedChord === entry.index ? null : entry.index)}
                  className={`absolute -translate-y-0.5 px-1 py-0.5 rounded text-[10px] font-bold whitespace-nowrap z-10 transition-all ${
                    selectedChord === entry.index
                      ? "bg-primary text-white ring-2 ring-primary/30"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                  style={{ fontSize: "10px" }}
                >
                  {entry.chord}
                </button>
              )}
            </span>
          );
        })}
        {/* Chord at end of text */}
        {chordMap.has(text.length) && (
          <span className="inline-block" style={{ width: "1ch" }}>
            <button
              onClick={() => {
                const entry = chordMap.get(text.length)!;
                setSelectedChord(selectedChord === entry.index ? null : entry.index);
              }}
              className={`absolute -translate-y-0.5 px-1 py-0.5 rounded text-[10px] font-bold whitespace-nowrap z-10 transition-all ${
                selectedChord === chordMap.get(text.length)!.index
                  ? "bg-primary text-white ring-2 ring-primary/30"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {chordMap.get(text.length)!.chord}
            </button>
          </span>
        )}
      </div>

      {/* Text row */}
      {editingText ? (
        <div className="flex items-center gap-1 mt-1">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveText();
              if (e.key === "Escape") setEditingText(false);
            }}
            autoFocus
            className="flex-1 font-mono text-sm px-1 py-0.5 border border-gray-300 rounded bg-white focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleSaveText}
            className="text-xs px-2 py-0.5 bg-primary text-white rounded hover:bg-primary/90"
          >
            OK
          </button>
          <button
            onClick={() => setEditingText(false)}
            className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div
          className={`font-mono text-sm leading-snug ${addingChord ? "cursor-crosshair" : ""}`}
          style={{ letterSpacing: "0ch" }}
        >
          {text.split("").map((char, i) => (
            <span
              key={`t${i}`}
              onClick={() => handleCharClick(i)}
              className={`inline-block ${
                addingChord
                  ? "hover:bg-yellow-200 cursor-crosshair"
                  : ""
              } ${newChordPos === i ? "bg-yellow-300" : ""}`}
              style={{ width: char === " " ? "1ch" : undefined }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      )}

      {/* New chord input (shown when adding) */}
      {addingChord && newChordPos !== null && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gray-500">Acorde:</span>
          <input
            ref={chordInputRef}
            type="text"
            value={newChordName}
            onChange={(e) => setNewChordName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddConfirm();
              if (e.key === "Escape") handleAddCancel();
            }}
            placeholder="Am, G7, C/E..."
            className="w-24 font-mono text-xs px-1.5 py-0.5 border border-yellow-400 rounded bg-yellow-50 focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleAddConfirm}
            className="text-xs px-2 py-0.5 bg-primary text-white rounded hover:bg-primary/90"
          >
            Agregar
          </button>
          <button
            onClick={handleAddCancel}
            className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Controls for selected chord */}
      {selectedChord !== null && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gray-500 mr-1">
            {chords[selectedChord]?.chord}:
          </span>
          <button
            onClick={() => handleMove(selectedChord, -1)}
            className="p-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Mover izquierda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleMove(selectedChord, 1)}
            className="p-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Mover derecha"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleRemove(selectedChord)}
            className="p-0.5 rounded bg-red-50 hover:bg-red-100 text-red-500 transition-colors ml-1"
            title="Eliminar acorde"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action buttons (shown on hover, hidden when adding/selecting) */}
      {selectedChord === null && !addingChord && !editingText && (
        <div className="hidden group-hover:flex items-center gap-1 mt-0.5">
          <button
            onClick={handleAddStart}
            className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-primary transition-colors"
            title="Agregar acorde"
          >
            <Plus className="w-3 h-3" />
            Acorde
          </button>
          <button
            onClick={handleEditText}
            className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-primary transition-colors"
            title="Editar letra"
          >
            <Pencil className="w-3 h-3" />
            Letra
          </button>
        </div>
      )}
    </div>
  );
}
