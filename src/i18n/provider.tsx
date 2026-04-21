"use client";

import { createContext, useMemo, type ReactNode } from "react";
import type { Dictionary } from "./en";
import type { Locale } from "./config";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}

export function I18nProvider({ locale, dict, children }: I18nProviderProps) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
