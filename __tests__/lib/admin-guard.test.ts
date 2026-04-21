import { describe, it, expect } from "vitest";
import { isAdminRole } from "@/lib/admin-guard";

describe("admin-guard", () => {
  it("treats 'admin' role as admin", () => {
    expect(isAdminRole("admin")).toBe(true);
  });

  it("treats 'user' role as non-admin", () => {
    expect(isAdminRole("user")).toBe(false);
  });

  it("treats missing role as non-admin", () => {
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});
