"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { COMMON_KEYS } from "@/lib/utils/keys";
import {
  getKeyFromSemitoneOffset,
  getSemitonesBetweenKeys,
  convertNotation,
} from "@/lib/chordpro/transpose";
import type { NotationMode } from "@/lib/chordpro/types";

interface TransposeControlsProps {
  originalKey: string;
  currentKey: string;
  onChange: (semitones: number, targetKey: string) => void;
  notation: NotationMode;
}

export function TransposeControls({
  originalKey,
  currentKey,
  onChange,
  notation,
}: TransposeControlsProps) {
  const currentSemitones = useMemo(
    () => getSemitonesBetweenKeys(originalKey, currentKey),
    [originalKey, currentKey]
  );

  const displayCurrentKey = useMemo(
    () =>
      notation === "solfege"
        ? convertNotation(currentKey, "solfege")
        : currentKey,
    [currentKey, notation]
  );

  const handleShift = (direction: 1 | -1) => {
    const newSemitones = ((currentSemitones + direction) % 12 + 12) % 12;
    const newKey = getKeyFromSemitoneOffset(originalKey, newSemitones);
    onChange(newSemitones, newKey);
  };

  const handleKeySelect = (key: string) => {
    const semitones = getSemitonesBetweenKeys(originalKey, key);
    onChange(semitones, key);
  };

  const handleReset = () => {
    onChange(0, originalKey);
  };

  const capoValue = currentSemitones > 0 ? 12 - currentSemitones : 0;

  const handleCapoChange = (capo: number) => {
    if (capo === 0) {
      handleReset();
      return;
    }
    // Capo at fret N means transpose down N semitones (to find the "shapes" key)
    // Or equivalently, the sounding key goes up by N semitones from shapes
    // We show chords as if transposed down by N
    const semitones = ((12 - capo) % 12 + 12) % 12;
    const newKey = getKeyFromSemitoneOffset(originalKey, semitones);
    onChange(semitones, newKey);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Current key display */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Tono:</span>
        <span className="text-lg font-bold text-foreground min-w-[3ch] text-center">
          {displayCurrentKey}
        </span>
      </div>

      {/* Semitone shift buttons */}
      <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => handleShift(-1)}
          className={cn(
            "flex items-center justify-center w-9 h-9",
            "hover:bg-gray-100 active:bg-gray-200 transition-colors"
          )}
          aria-label="Bajar medio tono"
          title="Bajar medio tono"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleShift(1)}
          className={cn(
            "flex items-center justify-center w-9 h-9 border-l border-gray-200",
            "hover:bg-gray-100 active:bg-gray-200 transition-colors"
          )}
          aria-label="Subir medio tono"
          title="Subir medio tono"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Key selector dropdown */}
      <select
        value={currentKey}
        onChange={(e) => handleKeySelect(e.target.value)}
        className={cn(
          "h-9 px-2 rounded-lg border border-gray-200 bg-white text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
        aria-label="Seleccionar tono"
      >
        {COMMON_KEYS.map((key) => {
          const label =
            notation === "solfege" ? convertNotation(key, "solfege") : key;
          return (
            <option key={key} value={key}>
              {label}
            </option>
          );
        })}
      </select>

      {/* Capo selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-500">Capo:</span>
        <select
          value={capoValue}
          onChange={(e) => handleCapoChange(parseInt(e.target.value))}
          className={cn(
            "h-9 px-2 rounded-lg border border-gray-200 bg-white text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
          aria-label="Seleccionar capo"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={i}>
              {i === 0 ? "Sin capo" : `Traste ${i}`}
            </option>
          ))}
        </select>
      </div>

      {/* Reset button */}
      {currentSemitones !== 0 && (
        <button
          type="button"
          onClick={handleReset}
          className={cn(
            "flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm",
            "border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          )}
          aria-label="Restaurar tono original"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Original</span>
        </button>
      )}
    </div>
  );
}
