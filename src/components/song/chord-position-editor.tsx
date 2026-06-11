"use client";

import { useState, useRef, useEffect } from "react";
import type { Line } from "@/lib/chordpro/types";
import {
  lineToPositions,
  positionsToLine,
  moveChord,
  addChord,
  removeChord,
  type ChordPosition,
} from "@/lib/chordpro/chord-position";
import { X, Plus, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

interface ChordPositionEditorProps {
  line: Line;
  onChange: (newLine: Line) => void;
  /** Whether this line is the active/focused one (only one line active at a time) */
  isActive?: boolean;
  /** Called when user interacts with this line (click chord, add, edit) */
  onActivate?: () => void;
}

export function ChordPositionEditor({ line, onChange, isActive = true, onActivate }: ChordPositionEditorProps) {
  const [selectedChord, setSelectedChord] = useState<number | null>(null);
  const [addingChord, setAddingChord] = useState(false);
  const [newChordName, setNewChordName] = useState("");
  const [newChordPos, setNewChordPos] = useState<number | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [editText, setEditText] = useState("");
  const [editingChord, setEditingChord] = useState(false);
  const [editChordName, setEditChordName] = useState("");

  // Drag state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragTargetPos, setDragTargetPos] = useState<number | null>(null);
  const didDragRef = useRef(false);
  const charMeasureRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chordInputRef = useRef<HTMLInputElement>(null);

  const { text, chords } = lineToPositions(line);

  // When this line becomes inactive (another line was activated), clear all editing state
  useEffect(() => {
    if (!isActive) {
      setSelectedChord(null);
      setAddingChord(false);
      setEditingText(false);
      setEditingChord(false);
      setNewChordName("");
      setNewChordPos(null);
      setEditChordName("");
    }
  }, [isActive]);

  // Empty line = spacer
  const isEmpty = text.trim() === "" && chords.length === 0;
  if (isEmpty) {
    return <div className="h-4" />;
  }

  const activate = () => {
    if (onActivate) onActivate();
  };

  // Calculate character position from mouse X coordinate
  const getCharPos = (clientX: number): number => {
    if (!containerRef.current) return 0;
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = clientX - containerRect.left;
    let chWidth: number;
    if (charMeasureRef.current) {
      chWidth = charMeasureRef.current.getBoundingClientRect().width;
    } else {
      chWidth = containerRect.width / Math.max(text.length, 1);
    }
    if (chWidth <= 0) chWidth = 8;
    const pos = Math.round(x / chWidth);
    return Math.max(0, Math.min(pos, text.length));
  };

  // --- Mouse drag handlers ---
  const handleDragStart = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activate();
    didDragRef.current = false;

    const startX = e.clientX;

    const onMouseMove = (ev: MouseEvent) => {
      if (!didDragRef.current && Math.abs(ev.clientX - startX) > 3) {
        didDragRef.current = true;
        setDraggingIndex(index);
        setSelectedChord(null);
        setEditingChord(false);
        setDragTargetPos(chords[index].position);
      }
      if (didDragRef.current) {
        const pos = getCharPos(ev.clientX);
        setDragTargetPos(pos);
      }
    };

    const onMouseUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (didDragRef.current) {
        const targetPos = getCharPos(ev.clientX);
        setDraggingIndex(null);
        setDragTargetPos(null);

        const hasCollision = chords.some(
          (c, i) => i !== index && c.position === targetPos
        );
        if (!hasCollision && targetPos !== chords[index].position) {
          const newChords = chords.map((c, i) =>
            i === index ? { ...c, position: targetPos } : c
          );
          onChange(positionsToLine(text, newChords));
        }
      } else {
        // Click - toggle selection
        setSelectedChord(prev => prev === index ? null : index);
        setEditingChord(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // --- Touch drag handlers ---
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    activate();
    didDragRef.current = false;

    const startX = e.touches[0].clientX;

    const onTouchMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const touch = ev.touches[0];
      if (!didDragRef.current && Math.abs(touch.clientX - startX) > 3) {
        didDragRef.current = true;
        setDraggingIndex(index);
        setSelectedChord(null);
        setEditingChord(false);
        setDragTargetPos(chords[index].position);
      }
      if (didDragRef.current) {
        const pos = getCharPos(touch.clientX);
        setDragTargetPos(pos);
      }
    };

    const onTouchEnd = (ev: TouchEvent) => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      if (didDragRef.current) {
        const touch = ev.changedTouches[0];
        const targetPos = getCharPos(touch.clientX);
        setDraggingIndex(null);
        setDragTargetPos(null);

        const hasCollision = chords.some(
          (c, i) => i !== index && c.position === targetPos
        );
        if (!hasCollision && targetPos !== chords[index].position) {
          const newChords = chords.map((c, i) =>
            i === index ? { ...c, position: targetPos } : c
          );
          onChange(positionsToLine(text, newChords));
        }
      } else {
        setSelectedChord(prev => prev === index ? null : index);
        setEditingChord(false);
      }
    };

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  };

  const handleMove = (index: number, delta: number) => {
    const newChords = moveChord(chords, index, delta, text.length);
    onChange(positionsToLine(text, newChords));
  };

  const handleRemove = (index: number) => {
    const newChords = removeChord(chords, index);
    onChange(positionsToLine(text, newChords));
    setSelectedChord(null);
    setEditingChord(false);
  };

  const handleEditChordStart = () => {
    if (selectedChord === null) return;
    setEditingChord(true);
    setEditChordName(chords[selectedChord].chord);
  };

  const handleEditChordConfirm = () => {
    if (selectedChord !== null && editChordName.trim()) {
      const newChords = chords.map((c, i) =>
        i === selectedChord ? { ...c, chord: editChordName.trim() } : c
      );
      onChange(positionsToLine(text, newChords));
    }
    setEditingChord(false);
    setEditChordName("");
  };

  const handleEditChordCancel = () => {
    setEditingChord(false);
    setEditChordName("");
  };

  const handleAddStart = () => {
    activate();
    setAddingChord(true);
    setNewChordName("");
    setNewChordPos(null);
    setSelectedChord(null);
    setEditingChord(false);
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
    activate();
    setEditingText(true);
    setEditText(text);
    setSelectedChord(null);
    setEditingChord(false);
    setAddingChord(false);
  };

  const handleSaveText = () => {
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

  const isDragging = draggingIndex !== null;

  // Render a chord badge
  const renderChordBadge = (entry: { chord: string; index: number }, isBeingDragged: boolean) => {
    if (isBeingDragged) {
      return (
        <span className="absolute -translate-y-0.5 px-1 py-0.5 rounded text-[10px] font-bold whitespace-nowrap bg-gray-200 text-gray-400 opacity-40" style={{ fontSize: "10px" }}>
          {entry.chord}
        </span>
      );
    }
    return (
      <button
        onMouseDown={(e) => handleDragStart(entry.index, e)}
        onTouchStart={(e) => handleTouchStart(entry.index, e)}
        className={`absolute -translate-y-0.5 px-1 py-0.5 rounded text-[10px] font-bold whitespace-nowrap z-10 transition-all cursor-grab active:cursor-grabbing ${
          selectedChord === entry.index
            ? "bg-primary text-white ring-2 ring-primary/30"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
        style={{ fontSize: "10px" }}
        title="Click para seleccionar, arrastra para mover"
      >
        {entry.chord}
      </button>
    );
  };

  return (
    <div className="group relative py-1.5 px-2 rounded hover:bg-white/80 transition-colors" ref={containerRef}>
      {/* Hidden measuring span */}
      <span
        ref={charMeasureRef}
        className="font-mono text-sm invisible absolute"
        style={{ letterSpacing: "0ch", width: "1ch" }}
        aria-hidden="true"
      >
        X
      </span>

      {/* Chord row */}
      <div className="font-mono text-xs leading-none h-5 relative" style={{ letterSpacing: "0ch" }}>
        <div className="flex" style={{ letterSpacing: "0ch" }}>
          {text.split("").map((_, i) => {
            const entry = chordMap.get(i);
            const isDragTarget = isDragging && dragTargetPos === i;
            const isBeingDragged = entry ? draggingIndex === entry.index : false;

            return (
              <span
                key={`c${i}`}
                className="inline-block relative"
                style={{ width: "1ch" }}
              >
                {isDragTarget && !entry && (
                  <span className="absolute -translate-y-0.5 w-0.5 h-4 bg-primary rounded-full z-20" />
                )}
                {entry && renderChordBadge(entry, isBeingDragged)}
              </span>
            );
          })}
          {chordMap.has(text.length) && (() => {
            const entry = chordMap.get(text.length)!;
            const isBeingDragged = draggingIndex === entry.index;
            return (
              <span className="inline-block relative" style={{ width: "1ch" }}>
                {renderChordBadge(entry, isBeingDragged)}
              </span>
            );
          })()}
        </div>
        {isDragging && dragTargetPos !== null && (
          <span
            className="absolute -translate-y-0.5 px-1 py-0.5 rounded text-[10px] font-bold whitespace-nowrap z-30 bg-primary text-white shadow-lg ring-2 ring-primary/30 pointer-events-none"
            style={{ fontSize: "10px", left: `${dragTargetPos}ch`, top: 0 }}
          >
            {chords[draggingIndex]?.chord}
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
          <button onClick={handleSaveText} className="text-xs px-2 py-0.5 bg-primary text-white rounded hover:bg-primary/90">
            OK
          </button>
          <button onClick={() => setEditingText(false)} className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">
            Cancelar
          </button>
        </div>
      ) : (
        <div
          className={`font-mono text-sm leading-snug ${addingChord ? "cursor-crosshair" : ""} ${isDragging ? "bg-yellow-50/50 rounded" : ""}`}
          style={{ letterSpacing: "0ch" }}
        >
          {text.split("").map((char, i) => (
            <span
              key={`t${i}`}
              onClick={() => handleCharClick(i)}
              className={`inline-block ${
                addingChord ? "hover:bg-yellow-200 cursor-crosshair" : ""
              } ${newChordPos === i ? "bg-yellow-300" : ""} ${
                isDragging && dragTargetPos === i ? "bg-primary/20" : ""
              }`}
              style={{ width: char === " " ? "1ch" : undefined }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      )}

      {/* New chord input */}
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
          <button onClick={handleAddConfirm} className="text-xs px-2 py-0.5 bg-primary text-white rounded hover:bg-primary/90">
            Agregar
          </button>
          <button onClick={handleAddCancel} className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">
            Cancelar
          </button>
        </div>
      )}

      {/* Controls for selected chord */}
      {selectedChord !== null && !isDragging && (
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {editingChord ? (
            <>
              <input
                type="text"
                value={editChordName}
                onChange={(e) => setEditChordName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditChordConfirm();
                  if (e.key === "Escape") handleEditChordCancel();
                }}
                autoFocus
                className="w-20 font-mono text-xs px-1.5 py-0.5 border border-blue-400 rounded bg-blue-50 focus:border-primary focus:outline-none"
                placeholder="Am7, G/B..."
              />
              <button onClick={handleEditChordConfirm} className="text-xs px-2 py-0.5 bg-primary text-white rounded hover:bg-primary/90">
                OK
              </button>
              <button onClick={handleEditChordCancel} className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">
                Cancelar
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-500 mr-1">
                {chords[selectedChord]?.chord}:
              </span>
              <button
                onClick={handleEditChordStart}
                className="p-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                title="Editar nombre del acorde"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
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
                className="p-0.5 rounded bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                title="Eliminar acorde"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="text-gray-300 mx-0.5">|</span>
              <button
                onClick={handleEditText}
                className="flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-primary transition-colors"
                title="Editar letra"
              >
                <Pencil className="w-3 h-3" />
                Letra
              </button>
              <button
                onClick={handleAddStart}
                className="flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-primary transition-colors"
                title="Agregar acorde"
              >
                <Plus className="w-3 h-3" />
                Acorde
              </button>
            </>
          )}
        </div>
      )}

      {/* Action buttons on hover (only when nothing is selected/editing) */}
      {selectedChord === null && !addingChord && !editingText && !isDragging && (
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
