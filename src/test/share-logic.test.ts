import { describe, it, expect } from "vitest";
import {
  normaliseEmails,
  selectNewRecipients,
  checkRecipientCap,
  MAX_RECIPIENTS_PER_REMINDER,
} from "../../supabase/functions/_shared/share-logic";

describe("normaliseEmails", () => {
  it("lowercases and trims", () => {
    expect(normaliseEmails(["  Foo@Bar.com "])).toEqual(["foo@bar.com"]);
  });

  it("dedupes case-insensitively", () => {
    expect(normaliseEmails(["a@b.com", "A@B.com", "a@b.com"])).toEqual(["a@b.com"]);
  });

  it("drops empty strings", () => {
    expect(normaliseEmails(["", "  ", "a@b.com"])).toEqual(["a@b.com"]);
  });

  it("preserves first-seen order", () => {
    expect(normaliseEmails(["c@x.com", "a@x.com", "b@x.com"])).toEqual([
      "c@x.com",
      "a@x.com",
      "b@x.com",
    ]);
  });
});

describe("selectNewRecipients", () => {
  it("excludes already-active recipients", () => {
    expect(
      selectNewRecipients(["a@x.com", "b@x.com"], ["a@x.com"], "owner@x.com"),
    ).toEqual(["b@x.com"]);
  });

  it("excludes the sender's own email", () => {
    expect(
      selectNewRecipients(["owner@x.com", "b@x.com"], [], "owner@x.com"),
    ).toEqual(["b@x.com"]);
  });

  it("matches sender email case-insensitively", () => {
    expect(
      selectNewRecipients(["owner@x.com"], [], "OWNER@X.com"),
    ).toEqual([]);
  });

  it("handles missing sender email", () => {
    expect(selectNewRecipients(["a@x.com"], [], null)).toEqual(["a@x.com"]);
    expect(selectNewRecipients(["a@x.com"], [], undefined)).toEqual(["a@x.com"]);
  });

  it("returns empty when all candidates are filtered out", () => {
    expect(
      selectNewRecipients(["a@x.com"], ["a@x.com"], "owner@x.com"),
    ).toEqual([]);
  });
});

describe("checkRecipientCap", () => {
  it("allows when under cap", () => {
    expect(checkRecipientCap(3, 5)).toEqual({ ok: true });
  });

  it("allows exactly at the cap", () => {
    expect(checkRecipientCap(7, 3)).toEqual({ ok: true });
    expect(checkRecipientCap(0, MAX_RECIPIENTS_PER_REMINDER)).toEqual({ ok: true });
  });

  it("rejects when total would exceed cap", () => {
    const result = checkRecipientCap(8, 5);
    expect(result.ok).toBe(false);
    const failure = result as Extract<typeof result, { ok: false }>;
    expect(failure.activeCount).toBe(8);
    expect(failure.max).toBe(MAX_RECIPIENTS_PER_REMINDER);
    expect(failure.message).toContain("at most 10");
    expect(failure.message).toContain("8");
  });

  it("respects custom max", () => {
    expect(checkRecipientCap(2, 1, 3)).toEqual({ ok: true });
    const result = checkRecipientCap(2, 2, 3);
    expect(result.ok).toBe(false);
  });
});
