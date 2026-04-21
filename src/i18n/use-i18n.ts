"use client";

import { useContext } from "react";
import { I18nContext } from "./provider";
import type { Dictionary } from "./en";
import type { Locale } from "./config";

type DotPath<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DotPath<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

function lookup(dict: Dictionary, path: string): string | string[] {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return cur as string | string[];
}

function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export interface UseI18n {
  locale: Locale;
  t: (
    path: DotPath<Dictionary>,
    vars?: Record<string, string | number>,
  ) => string;
  tArray: (path: DotPath<Dictionary>) => string[];
  setLocale: (next: Locale) => Promise<void>;
}

export function useI18n(): UseI18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");

  return {
    locale: ctx.locale,
    t: (path, vars) => {
      const raw = lookup(ctx.dict, path as string);
      if (typeof raw !== "string") return String(raw);
      return vars ? format(raw, vars) : raw;
    },
    tArray: (path) => {
      const raw = lookup(ctx.dict, path as string);
      return Array.isArray(raw) ? raw : [];
    },
    setLocale: async (next) => {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      try {
        await fetch("/api/i18n", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: next }),
        });
      } catch {
        // Cookie alone is sufficient for unauthenticated users.
      }
      location.reload();
    },
  };
}

export type { DotPath };
