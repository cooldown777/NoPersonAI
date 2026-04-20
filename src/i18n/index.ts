import { en } from "./en";
import { de } from "./de";
import { fr } from "./fr";
import { es } from "./es";
import type { Locale } from "./config";
import type { Dictionary } from "./en";

const DICTIONARIES: Record<Locale, Dictionary> = { en, de, fr, es };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Locale, Dictionary };
