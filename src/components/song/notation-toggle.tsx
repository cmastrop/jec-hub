"use client";

import { cn } from "@/lib/utils/cn";
import type { NotationMode } from "@/lib/chordpro/types";

interface NotationToggleProps {
  notation: NotationMode;
  onChange: (mode: NotationMode) => void;
}

export function NotationToggle({ notation, onChange }: NotationToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Notacion:</span>
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => onChange("solfege")}
          className={cn(
            "px-3 h-9 text-sm font-medium transition-colors",
            notation === "solfege"
              ? "bg-primary text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Solfeo
        </button>
        <button
          type="button"
          onClick={() => onChange("letter")}
          className={cn(
            "px-3 h-9 text-sm font-medium transition-colors border-l border-gray-200",
            notation === "letter"
              ? "bg-primary text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Cifrado
        </button>
      </div>
    </div>
  );
}
