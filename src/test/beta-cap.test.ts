import { describe, it, expect } from "vitest";
import { isOverCap, BETA_ANALYSIS_CAP } from "@/lib/beta-limits";

describe("beta cap logic", () => {
  it("constant is 30", () => {
    expect(BETA_ANALYSIS_CAP).toBe(30);
  });

  it("returns false at 0 used", () => {
    expect(isOverCap(0)).toBe(false);
  });

  it("returns false at 29 used", () => {
    expect(isOverCap(29)).toBe(false);
  });

  it("returns true at 30 used (cap reached)", () => {
    expect(isOverCap(30)).toBe(true);
  });

  it("returns true at 31 used (over cap)", () => {
    expect(isOverCap(31)).toBe(true);
  });

  it("respects custom limit", () => {
    expect(isOverCap(5, 10)).toBe(false);
    expect(isOverCap(10, 10)).toBe(true);
    expect(isOverCap(11, 10)).toBe(true);
  });
});
