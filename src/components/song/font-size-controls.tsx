"use client";

import { cn } from "@/lib/utils/cn";
import { Minus, Plus } from "lucide-react";

interface FontSizeControlsProps {
  fontSize: number;
  onChange: (newSize: number) => void;
}

const MIN_SIZE = 12;
const MAX_SIZE = 32;

export function FontSizeControls({ fontSize, onChange }: FontSizeControlsProps) {
  const handleDecrease = () => {
    if (fontSize > MIN_SIZE) {
      onChange(fontSize - 1);
    }
  };

  const handleIncrease = () => {
    if (fontSize < MAX_SIZE) {
      onChange(fontSize + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Texto:</span>
      <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={fontSize <= MIN_SIZE}
          className={cn(
            "flex items-center justify-center w-9 h-9",
            "hover:bg-gray-100 active:bg-gray-200 transition-colors",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
          aria-label="Reducir tamano de fuente"
          title="Reducir tamano"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium tabular-nums border-x border-gray-200">
          {fontSize}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          disabled={fontSize >= MAX_SIZE}
          className={cn(
            "flex items-center justify-center w-9 h-9",
            "hover:bg-gray-100 active:bg-gray-200 transition-colors",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
          aria-label="Aumentar tamano de fuente"
          title="Aumentar tamano"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
