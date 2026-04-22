// Pure helpers for the check-deadlines edge function.
// Deno-free so they can be unit-tested with vitest.

export const SEND_HOUR_TODAY = 8;
export const SEND_HOUR_TOMORROW = 18;

/** Compute YYYY-MM-DD and current hour (0-23) in a given IANA timezone. */
export function localParts(now: Date, tz: string): { date: string; hour: number } {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const date = `${get("year")}-${get("month")}-${get("day")}`;
    const hour = parseInt(get("hour"), 10);
    return { date, hour: isNaN(hour) ? 0 : hour };
  } catch {
    const date = now.toISOString().slice(0, 10);
    return { date, hour: now.getUTCHours() };
  }
}

/** Add `days` to a YYYY-MM-DD date string, returning YYYY-MM-DD. */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Strip optional time portion off a deadline like "2026-04-22T09:00". */
export function deadlineDatePart(deadline: string): string {
  return deadline?.split("T")[0] ?? deadline;
}

export type DueClassification = "due_today" | "due_tomorrow" | null;

/** Classify a deadline relative to a user's local date. */
export function classifyDue(deadline: string, localDate: string): DueClassification {
  const date = deadlineDatePart(deadline);
  if (date === localDate) return "due_today";
  if (date === addDays(localDate, 1)) return "due_tomorrow";
  return null;
}

/** Should we send right now given the user's local hour and the notification type? */
export function shouldSendNow(
  type: "due_today" | "due_tomorrow",
  localHour: number,
  forceSend = false,
): boolean {
  if (forceSend) return true;
  const target = type === "due_today" ? SEND_HOUR_TODAY : SEND_HOUR_TOMORROW;
  return localHour === target;
}
