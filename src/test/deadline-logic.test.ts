import { describe, it, expect } from "vitest";
import {
  localParts,
  addDays,
  deadlineDatePart,
  classifyDue,
  shouldSendNow,
  SEND_HOUR_TODAY,
  SEND_HOUR_TOMORROW,
} from "../../supabase/functions/_shared/deadline-logic";

describe("addDays", () => {
  it("adds positive days", () => {
    expect(addDays("2026-04-22", 1)).toBe("2026-04-23");
  });

  it("crosses month boundaries", () => {
    expect(addDays("2026-04-30", 1)).toBe("2026-05-01");
  });

  it("crosses year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("handles leap day", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2028-02-29", 1)).toBe("2028-03-01");
  });
});

describe("deadlineDatePart", () => {
  it("strips the time portion", () => {
    expect(deadlineDatePart("2026-04-22T09:00")).toBe("2026-04-22");
  });

  it("returns date-only strings unchanged", () => {
    expect(deadlineDatePart("2026-04-22")).toBe("2026-04-22");
  });
});

describe("classifyDue", () => {
  it("classifies same-date as due_today", () => {
    expect(classifyDue("2026-04-22T09:00", "2026-04-22")).toBe("due_today");
    expect(classifyDue("2026-04-22", "2026-04-22")).toBe("due_today");
  });

  it("classifies next-date as due_tomorrow", () => {
    expect(classifyDue("2026-04-23T09:00", "2026-04-22")).toBe("due_tomorrow");
  });

  it("returns null for past dates", () => {
    expect(classifyDue("2026-04-21", "2026-04-22")).toBeNull();
  });

  it("returns null for dates further in future", () => {
    expect(classifyDue("2026-04-24", "2026-04-22")).toBeNull();
  });
});

describe("shouldSendNow", () => {
  it("sends due_today only at 8am local", () => {
    expect(shouldSendNow("due_today", SEND_HOUR_TODAY)).toBe(true);
    expect(shouldSendNow("due_today", 7)).toBe(false);
    expect(shouldSendNow("due_today", 9)).toBe(false);
  });

  it("sends due_tomorrow only at 6pm local", () => {
    expect(shouldSendNow("due_tomorrow", SEND_HOUR_TOMORROW)).toBe(true);
    expect(shouldSendNow("due_tomorrow", 17)).toBe(false);
    expect(shouldSendNow("due_tomorrow", 19)).toBe(false);
  });

  it("forceSend bypasses time gate", () => {
    expect(shouldSendNow("due_today", 3, true)).toBe(true);
    expect(shouldSendNow("due_tomorrow", 23, true)).toBe(true);
  });
});

describe("localParts", () => {
  // 2026-04-22 12:00 UTC
  const noonUtc = new Date("2026-04-22T12:00:00Z");

  it("returns YYYY-MM-DD format", () => {
    const result = localParts(noonUtc, "UTC");
    expect(result.date).toBe("2026-04-22");
    expect(result.hour).toBe(12);
  });

  it("shifts date for west-of-UTC zones near midnight UTC", () => {
    // 2026-04-22 02:00 UTC => 2026-04-21 22:00 in New York (UTC-4 DST)
    const earlyUtc = new Date("2026-04-22T02:00:00Z");
    const result = localParts(earlyUtc, "America/New_York");
    expect(result.date).toBe("2026-04-21");
    expect(result.hour).toBe(22);
  });

  it("shifts date for east-of-UTC zones near end of day UTC", () => {
    // 2026-04-22 23:00 UTC => 2026-04-23 08:00 in Tokyo (UTC+9)
    const lateUtc = new Date("2026-04-22T23:00:00Z");
    const result = localParts(lateUtc, "Asia/Tokyo");
    expect(result.date).toBe("2026-04-23");
    expect(result.hour).toBe(8);
  });

  it("falls back to UTC for invalid timezone", () => {
    const result = localParts(noonUtc, "Not/A_Zone");
    expect(result.date).toBe("2026-04-22");
    expect(result.hour).toBe(12);
  });
});
