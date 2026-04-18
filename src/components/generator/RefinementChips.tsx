"use client";

import type { RefinementAction } from "@/lib/ai/types";
import {
  Zap,
  Target,
  Lightbulb,
  Minimize2,
  Maximize2,
  SmilePlus,
  Briefcase,
  Coffee,
  Compass,
  Meh,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface RefinementChipsProps {
  onRefine: (action: RefinementAction) => void;
  isRefining: boolean;
  language: "de" | "en";
}

const chips: {
  action: RefinementAction;
  en: string;
  de: string;
  icon: LucideIcon;
}[] = [
  { action: "stronger_hook", en: "Stronger hook", de: "Stärkerer Hook", icon: Zap },
  { action: "different_cta", en: "Different CTA", de: "Anderer CTA", icon: Target },
  { action: "change_takeaway", en: "Different takeaway", de: "Andere Erkenntnis", icon: Lightbulb },
  { action: "shorter", en: "Shorter", de: "Kürzer", icon: Minimize2 },
  { action: "longer", en: "Longer", de: "Länger", icon: Maximize2 },
  { action: "more_casual", en: "More casual", de: "Lockerer", icon: Coffee },
  { action: "more_professional", en: "More professional", de: "Professioneller", icon: Briefcase },
  { action: "add_emojis", en: "Add emojis", de: "Mehr Emojis", icon: SmilePlus },
  { action: "remove_emojis", en: "Remove emojis", de: "Ohne Emojis", icon: Meh },
  { action: "different_angle", en: "Different angle", de: "Anderer Blickwinkel", icon: Compass },
];

export default function RefinementChips({
  onRefine,
  isRefining,
  language,
}: RefinementChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {chips.map((chip) => {
        const Icon = chip.icon;
        return (
          <button
            key={chip.action}
            onClick={() => onRefine(chip.action)}
            disabled={isRefining}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-all hover:-translate-y-px hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
          >
            <Icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-brand-600" />
            {language === "de" ? chip.de : chip.en}
          </button>
        );
      })}
    </div>
  );
}
