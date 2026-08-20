import { describe, it, expect } from "vitest";
import { isAutoConfirm } from "../match";

describe("isAutoConfirm", () => {
  it("confirms at and above the 0.45 threshold", () => {
    expect(isAutoConfirm(0.45)).toBe(true);
    expect(isAutoConfirm(0.9)).toBe(true);
  });

  it("does not confirm below the threshold", () => {
    expect(isAutoConfirm(0.44)).toBe(false);
    expect(isAutoConfirm(0)).toBe(false);
  });
});
