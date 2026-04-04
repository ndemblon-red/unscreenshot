/**
 * Deadline utilities — maps semantic labels to real YYYY-MM-DDTHH:MM strings
 * and derives labels back from dates for display.
 *
 * Format: "YYYY-MM-DDTHH:MM" (e.g. "2026-04-05T09:00")
 * Legacy "YYYY-MM-DD" values are treated as T09:00 for backward compat.
 */

export const DEADLINE_OPTIONS = ["Tomorrow", "Next Week", "Next Month"] as const;
export type DeadlineOption = (typeof DEADLINE_OPTIONS)[number];

/** Extract the date portion (YYYY-MM-DD) from a deadline string. */
export function extractDate(deadline: string): string {
  return deadline.split("T")[0];
}

/** Extract the time portion (HH:MM) from a deadline string. Defaults to "09:00". */
export function extractTime(deadline: string): string {
  const parts = deadline.split("T");
  return parts.length > 1 && /^\d{2}:\d{2}$/.test(parts[1]) ? parts[1] : "09:00";
}

/** Check if a string is a valid deadline (YYYY-MM-DD or YYYY-MM-DDTHH:MM). */
export function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(value);
}

/** Convert a semantic label to a YYYY-MM-DDTHH:MM string (defaults to 09:00). */
export function deadlineLabelToDate(label: DeadlineOption): string {
  const d = new Date();
  switch (label) {
    case "Tomorrow":
      d.setDate(d.getDate() + 1);
      break;
    case "Next Week":
      d.setDate(d.getDate() + 7);
      break;
    case "Next Month":
      d.setMonth(d.getMonth() + 1);
      break;
  }
  return d.toISOString().split("T")[0] + "T09:00";
}

/** Format a time string like "09:00" or "14:30" to "9 AM" or "2:30 PM". */
function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/**
 * Derive a friendly label from a deadline string.
 * Returns e.g. "Tomorrow · 9 AM", "Next Week · 9 AM",
 * "15 March 2026 · 2:30 PM", or "Today · 9 AM".
 */
export function dateToDeadlineLabel(dateStr: string): string {
  if (!isDateString(dateStr)) return dateStr; // legacy label fallback

  const datePart = extractDate(dateStr);
  const timePart = extractTime(dateStr);
  const timeLabel = formatTime(timePart);

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (datePart === today) return `Today · ${timeLabel}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (datePart === tomorrow.toISOString().split("T")[0]) return `Tomorrow · ${timeLabel}`;

  const todayDate = new Date(today + "T00:00:00");
  const target = new Date(datePart + "T00:00:00");
  const weekday = target.toLocaleDateString("en-GB", { weekday: "long" });

  // Compute Monday of current week (Mon=1…Sun=0→7)
  const todayDay = todayDate.getDay() || 7; // convert Sun=0 to 7
  const currentMonday = new Date(todayDate);
  currentMonday.setDate(todayDate.getDate() - (todayDay - 1));
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);
  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);

  // Later this week (same Mon–Sun block, after tomorrow)
  if (target >= todayDate && target < nextMonday && target > tomorrow) {
    return `${weekday} · ${timeLabel}`;
  }

  // Next calendar week
  if (target >= nextMonday && target <= nextSunday) {
    return `Next ${weekday} · ${timeLabel}`;
  }

  // Everything else → "21 May 2026 · 9 AM"
  const formatted = target.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${formatted} · ${timeLabel}`;
}

/** Return urgency level for a deadline date. */
export function getDeadlineUrgency(dateStr: string): "today" | "tomorrow" | null {
  if (!isDateString(dateStr)) return null;
  const datePart = extractDate(dateStr);
  const today = new Date().toISOString().split("T")[0];
  if (datePart === today) return "today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (datePart === tomorrow.toISOString().split("T")[0]) return "tomorrow";
  return null;
}
