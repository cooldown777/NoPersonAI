"use client";

import { cn } from "@/lib/utils";

export const VARIANT_COUNTS = [1, 3, 5, 7, 10] as const;
export type VariantCount = (typeof VARIANT_COUNTS)[number];

interface Props {
  value: VariantCount;
  onChange: (n: VariantCount) => void;
  disabled?: boolean;
  remaining: number | null;
}

export default function VariantSelector({ value, onChange, disabled, remaining }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium text-zinc-600">Variants</span>
      <div className="flex gap-1.5">
        {VARIANT_COUNTS.map((n) => {
          const unaffordable = remaining !== null && n > remaining;
          const isActive = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              disabled={disabled || unaffordable}
              className={cn(
                "min-w-[38px] rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors",
                isActive && "bg-brand-600 text-white",
                !isActive && !unaffordable && "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                unaffordable && "border border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed",
              )}
              aria-pressed={isActive}
              title={unaffordable ? "Upgrade to Pro for more" : `Generate ${n} variant${n > 1 ? "s" : ""}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
