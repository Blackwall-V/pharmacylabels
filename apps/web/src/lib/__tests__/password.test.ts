import { describe, it, expect } from "vitest";
import { passwordMatches } from "../password";

describe("passwordMatches", () => {
  it("returns true for identical strings", () => {
    expect(passwordMatches("correct-horse", "correct-horse")).toBe(true);
  });

  it("returns false for different strings of the same length", () => {
    expect(passwordMatches("correct-horsX", "correct-horse")).toBe(false);
  });

  it("returns false when lengths differ, without throwing", () => {
    expect(passwordMatches("short", "a-much-longer-password")).toBe(false);
    expect(passwordMatches("a-much-longer-password", "short")).toBe(false);
  });

  it("returns false for an empty input against a non-empty expected value", () => {
    expect(passwordMatches("", "not-empty")).toBe(false);
  });
});
