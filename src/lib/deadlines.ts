/**
 * Deadline utilities — maps semantic labels to real YYYY-MM-DD dates
 * and derives labels back from dates for display.
 */

export const DEADLINE_OPTIONS = ["Tomorrow", "Next Week", "Next Month"] as const;
export type DeadlineOption = (typeof DEADLINE_OPTIONS)[number];

/** Convert a semantic label to a YYYY-MM-DD string. */
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
  return d.toISOString().split("T")[0];
}

/** Check if a string is a YYYY-MM-DD date. */
export function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Derive a friendly label from a YYYY-MM-DD date.
 * Returns "Tomorrow" / "Next Week" / "Next Month" if the date matches,
 * otherwise returns a formatted date string like "15 March 2026".
 */
export function dateToDeadlineLabel(dateStr: string): string {
  if (!isDateString(dateStr)) return dateStr; // legacy label fallback

  const today = new Date().toISOString().split("T")[0];
  if (dateStr === today) return "Today";

  for (const label of DEADLINE_OPTIONS) {
    if (deadlineLabelToDate(label) === dateStr) return label;
  }

  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Return urgency level for a deadline date. */
export function getDeadlineUrgency(dateStr: string): "today" | "tomorrow" | null {
  if (!isDateString(dateStr)) return null;
  const today = new Date().toISOString().split("T")[0];
  if (dateStr === today) return "today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === tomorrow.toISOString().split("T")[0]) return "tomorrow";
  return null;
}
