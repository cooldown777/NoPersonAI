import { describe, it, expect } from "vitest";
import { resolveLocaleFromInputs } from "@/i18n/resolve-locale";

describe("resolveLocaleFromInputs", () => {
  it("prefers userPreferred when supported", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: "de",
        cookie: "fr",
        acceptLanguage: "es,en",
      }),
    ).toBe("de");
  });

  it("falls back to cookie when no user preference", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: null,
        cookie: "fr",
        acceptLanguage: "es,en",
      }),
    ).toBe("fr");
  });

  it("picks first supported from Accept-Language", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: null,
        cookie: null,
        acceptLanguage: "ja,zh,es,en",
      }),
    ).toBe("es");
  });

  it("defaults to en when nothing matches", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: null,
        cookie: null,
        acceptLanguage: "ja,zh",
      }),
    ).toBe("en");
  });

  it("ignores unsupported user preference and falls through", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: "ja" as unknown as "en",
        cookie: "fr",
        acceptLanguage: null,
      }),
    ).toBe("fr");
  });
});
