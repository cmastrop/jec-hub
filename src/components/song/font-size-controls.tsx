"use client";

import { cn } from "@/lib/utils/cn";
import { Minus, Plus, Music, Type } from "lucide-react";

interface FontSizeControlsProps {
  fontSize: number;
  chordFontSize: number;
  onFontSizeChange: (newSize: number) => void;
  onChordFontSizeChange: (newSize: number) => void;
}

const MIN_SIZE = 10;
const MAX_SIZE = 36;

function SizeControl({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-1 text-xs text-gray-500">
        {icon}
        {label}:
      </span>
      <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => value > MIN_SIZE && onChange(value - 1)}
          disabled={value <= MIN_SIZE}
          className={cn(
            "flex items-center justify-center w-7 h-7",
            "hover:bg-gray-100 active:bg-gray-200 transition-colors",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
          aria-label={`Reducir ${label}`}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-xs font-medium tabular-nums border-x border-gray-200">
          {value}
        </span>
        <button
          type="button"
          onClick={() => value < MAX_SIZE && onChange(value + 1)}
          disabled={value >= MAX_SIZE}
          className={cn(
            "flex items-center justify-center w-7 h-7",
            "hover:bg-gray-100 active:bg-gray-200 transition-colors",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
          aria-label={`Aumentar ${label}`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function FontSizeControls({
  fontSize,
  chordFontSize,
  onFontSizeChange,
  onChordFontSizeChange,
}: FontSizeControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <SizeControl
        label="Letra"
        icon={<Type className="w-3.5 h-3.5" />}
        value={fontSize}
        onChange={onFontSizeChange}
      />
      <SizeControl
        label="Acordes"
        icon={<Music className="w-3.5 h-3.5" />}
        value={chordFontSize}
        onChange={onChordFontSizeChange}
      />
    </div>
  );
}
