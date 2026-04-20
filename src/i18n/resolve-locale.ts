import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, type Locale } from "./config";

interface Inputs {
  userPreferred: string | null;
  cookie: string | null;
  acceptLanguage: string | null;
}

export function resolveLocaleFromInputs(inputs: Inputs): Locale {
  if (isLocale(inputs.userPreferred)) return inputs.userPreferred;
  if (isLocale(inputs.cookie)) return inputs.cookie;
  if (inputs.acceptLanguage) {
    const candidates = inputs.acceptLanguage
      .split(",")
      .map((s) => s.split(";")[0].trim().toLowerCase().slice(0, 2));
    for (const c of candidates) {
      if (isLocale(c)) return c;
    }
  }
  return DEFAULT_LOCALE;
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
