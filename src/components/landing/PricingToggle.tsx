"use client";

import { cn } from "@/lib/utils";

export type BillingPeriod = "monthly" | "yearly";

interface PricingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  discountLabel?: string;
}

export default function PricingToggle({
  value,
  onChange,
  discountLabel = "Save 15%",
}: PricingToggleProps) {
  return (
    <div
      role="group"
      aria-label="Billing period"
      className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white p-1"
    >
      <button
        type="button"
        aria-pressed={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          value === "monthly"
            ? "bg-zinc-900 text-white"
            : "text-zinc-600 hover:text-zinc-900",
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        aria-pressed={value === "yearly"}
        aria-label={`Yearly, ${discountLabel.toLowerCase()}`}
        onClick={() => onChange("yearly")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          value === "yearly"
            ? "bg-zinc-900 text-white"
            : "text-zinc-600 hover:text-zinc-900",
        )}
      >
        Yearly
        <span
          aria-hidden="true"
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            value === "yearly"
              ? "bg-accent-500 text-white"
              : "bg-accent-100 text-accent-700",
          )}
        >
          {discountLabel}
        </span>
      </button>
    </div>
  );
}
