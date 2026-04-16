"use client";

import type { RefinementAction } from "@/lib/ai/types";

interface RefinementChipsProps {
  onRefine: (action: RefinementAction) => void;
  isRefining: boolean;
  language: "de" | "en";
}

const chips: { action: RefinementAction; en: string; de: string }[] = [
  { action: "stronger_hook", en: "Stronger hook", de: "Stärkerer Hook" },
  { action: "different_cta", en: "Different CTA", de: "Anderer CTA" },
  { action: "change_takeaway", en: "Different takeaway", de: "Andere Erkenntnis" },
  { action: "shorter", en: "Shorter", de: "Kürzer" },
  { action: "longer", en: "Longer", de: "Länger" },
  { action: "more_casual", en: "More casual", de: "Lockerer" },
  { action: "more_professional", en: "More professional", de: "Professioneller" },
  { action: "add_emojis", en: "Add emojis", de: "Mehr Emojis" },
  { action: "remove_emojis", en: "Remove emojis", de: "Ohne Emojis" },
  { action: "different_angle", en: "Different angle", de: "Anderer Blickwinkel" },
];

export default function RefinementChips({
  onRefine,
  isRefining,
  language,
}: RefinementChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {chips.map((chip) => (
        <button
          key={chip.action}
          onClick={() => onRefine(chip.action)}
          disabled={isRefining}
          className="shrink-0 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {language === "de" ? chip.de : chip.en}
        </button>
      ))}
    </div>
  );
}
