// Pure helpers for the share-reminder edge function.
// Kept Deno-free so they can be unit-tested with vitest.

export const MAX_RECIPIENTS_PER_REMINDER = 10;

/** Lowercase, trim, and dedupe a list of emails (preserves first-seen order). */
export function normaliseEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of emails) {
    const e = raw.trim().toLowerCase();
    if (!e || seen.has(e)) continue;
    seen.add(e);
    out.push(e);
  }
  return out;
}

/** Filter out emails already actively shared and the sender's own email. */
export function selectNewRecipients(
  candidates: string[],
  existingActive: string[],
  senderEmail: string | null | undefined,
): string[] {
  const existingSet = new Set(existingActive.map((e) => e.toLowerCase()));
  const sender = (senderEmail ?? "").toLowerCase();
  return candidates.filter((e) => !existingSet.has(e) && e !== sender);
}

export type CapResult =
  | { ok: true }
  | { ok: false; activeCount: number; max: number; message: string };

/** Enforce the per-reminder recipient cap. */
export function checkRecipientCap(
  activeCount: number,
  newCount: number,
  max: number = MAX_RECIPIENTS_PER_REMINDER,
): CapResult {
  if (activeCount + newCount <= max) return { ok: true };
  return {
    ok: false,
    activeCount,
    max,
    message: `This reminder can be shared with at most ${max} people. Currently shared with ${activeCount}.`,
  };
}
