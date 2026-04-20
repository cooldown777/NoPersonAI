import { describe, it, expect } from "vitest";
import { shouldRedirectFromOnboarding } from "@/app/onboarding/guard-logic";

describe("shouldRedirectFromOnboarding", () => {
  it("redirects to /auth/signin when no session", () => {
    expect(shouldRedirectFromOnboarding({ hasSession: false, hasDna: false })).toBe(
      "/auth/signin",
    );
  });

  it("redirects to /app when session and DNA both present", () => {
    expect(shouldRedirectFromOnboarding({ hasSession: true, hasDna: true })).toBe(
      "/app",
    );
  });

  it("returns null (render onboarding) when session present but no DNA", () => {
    expect(shouldRedirectFromOnboarding({ hasSession: true, hasDna: false })).toBe(
      null,
    );
  });
});
