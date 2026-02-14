import { cn } from "@/lib/utils/cn";
import type { SectionType } from "@/lib/chordpro/types";

interface SectionHeaderProps {
  type: SectionType;
  label: string;
}

const sectionColorClass: Record<SectionType, string> = {
  verse: "section-verse",
  chorus: "section-chorus",
  bridge: "section-bridge",
  precoro: "section-precoro",
  intro: "section-verse",
  outro: "section-verse",
  interlude: "section-bridge",
  tag: "section-chorus",
  comment: "section-verse",
  unknown: "section-verse",
};

const sectionTextColorMap: Record<string, string> = {
  "section-verse": "text-[var(--section-verse)]",
  "section-chorus": "text-[var(--section-chorus)]",
  "section-bridge": "text-[var(--section-bridge)]",
  "section-precoro": "text-[var(--section-precoro)]",
};

export function SectionHeader({ type, label }: SectionHeaderProps) {
  const colorKey = sectionColorClass[type] || "section-verse";
  const textColor = sectionTextColorMap[colorKey] || "text-[var(--section-verse)]";

  return (
    <div
      className={cn(
        "border-l-4 pl-3 py-1 mb-2 mt-6 first:mt-0",
        colorKey
      )}
    >
      <span
        className={cn(
          "text-sm font-bold uppercase tracking-wide",
          textColor
        )}
      >
        {label}
      </span>
    </div>
  );
}
