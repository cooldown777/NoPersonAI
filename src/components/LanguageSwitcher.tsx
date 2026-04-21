"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
          >
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l}
                role="menuitemradio"
                aria-checked={l === locale}
                onClick={() => {
                  setOpen(false);
                  if (l !== locale) setLocale(l as Locale);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <span>{LOCALE_LABELS[l as Locale]}</span>
                {l === locale && <Check className="h-3.5 w-3.5 text-brand-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
