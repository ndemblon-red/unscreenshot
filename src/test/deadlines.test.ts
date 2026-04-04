import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { dateToDeadlineLabel } from "@/lib/deadlines";

// Fix "today" to Wednesday 2026-04-08 at noon UTC
// Current week: Mon Apr 6 – Sun Apr 12
// Next week:    Mon Apr 13 – Sun Apr 19
const FAKE_NOW = new Date("2026-04-08T12:00:00Z");

describe("dateToDeadlineLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Today · 9 AM' for today's date", () => {
    expect(dateToDeadlineLabel("2026-04-08T09:00")).toBe("Today · 9 AM");
  });

  it("returns 'Today · 2:30 PM' with custom time", () => {
    expect(dateToDeadlineLabel("2026-04-08T14:30")).toBe("Today · 2:30 PM");
  });

  it("returns 'Tomorrow · 9 AM' for tomorrow", () => {
    expect(dateToDeadlineLabel("2026-04-09T09:00")).toBe("Tomorrow · 9 AM");
  });

  it("returns '{Weekday} · 9 AM' for later this week (Friday)", () => {
    expect(dateToDeadlineLabel("2026-04-10T09:00")).toBe("Friday · 9 AM");
  });

  it("returns '{Weekday} · 9 AM' for Saturday this week", () => {
    expect(dateToDeadlineLabel("2026-04-11T09:00")).toBe("Saturday · 9 AM");
  });

  it("returns '{Weekday} · 9 AM' for Sunday this week", () => {
    expect(dateToDeadlineLabel("2026-04-12T09:00")).toBe("Sunday · 9 AM");
  });

  it("returns 'Next {Weekday} · 9 AM' for Monday next week", () => {
    expect(dateToDeadlineLabel("2026-04-13T09:00")).toBe("Next Monday · 9 AM");
  });

  it("returns 'Next {Weekday} · 9 AM' for Wednesday next week", () => {
    expect(dateToDeadlineLabel("2026-04-15T09:00")).toBe("Next Wednesday · 9 AM");
  });

  it("returns 'Next {Weekday} · 9 AM' for Sunday next week", () => {
    expect(dateToDeadlineLabel("2026-04-19T09:00")).toBe("Next Sunday · 9 AM");
  });

  it("returns full date for dates beyond next week", () => {
    expect(dateToDeadlineLabel("2026-04-20T09:00")).toBe("20 April 2026 · 9 AM");
  });

  it("returns full date for a date far in the future", () => {
    expect(dateToDeadlineLabel("2026-12-25T10:00")).toBe("25 December 2026 · 10 AM");
  });

  it("defaults to 9 AM for legacy YYYY-MM-DD format", () => {
    expect(dateToDeadlineLabel("2026-04-08")).toBe("Today · 9 AM");
  });

  it("returns the string as-is for non-date values", () => {
    expect(dateToDeadlineLabel("Next Week")).toBe("Next Week");
  });

  it("returns full date for past dates", () => {
    expect(dateToDeadlineLabel("2026-03-01T09:00")).toBe("1 March 2026 · 9 AM");
  });
});
