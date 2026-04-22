import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Hoisted supabase mocks. The dialog uses three things from supabase:
//  - .from("reminder_shares").select(...).eq(...).is(...).order(...)
//  - .from("reminder_shares").update(...).eq(...)
//  - .functions.invoke("share-reminder", { body })
const mocks = vi.hoisted(() => {
  return {
    selectResult: { data: [] as any[], error: null as any },
    invokeResult: { data: { shared: 0, skipped: 0 } as any, error: null as any },
    updateResult: { error: null as any },
    invoke: vi.fn(),
    update: vi.fn(),
  };
});

vi.mock("@/integrations/supabase/client", () => {
  // Build a chainable thenable-ish select chain.
  function selectChain() {
    const chain: any = {
      eq: () => chain,
      is: () => chain,
      order: () => Promise.resolve(mocks.selectResult),
    };
    return chain;
  }
  return {
    supabase: {
      from: () => ({
        select: () => selectChain(),
        update: (...args: any[]) => {
          mocks.update(...args);
          return { eq: () => Promise.resolve(mocks.updateResult) };
        },
      }),
      functions: { invoke: mocks.invoke },
    },
  };
});

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    message: vi.fn(),
  },
}));

import ShareReminderDialog from "@/components/ShareReminderDialog";
import { toast } from "sonner";

const REMINDER_ID = "11111111-1111-1111-1111-111111111111";

function renderDialog(activeShares: any[] = []) {
  mocks.selectResult.data = activeShares;
  mocks.selectResult.error = null;
  return render(
    <ShareReminderDialog open onOpenChange={() => {}} reminderId={REMINDER_ID} />,
  );
}

async function addEmail(value: string) {
  const input = screen.getByPlaceholderText("email@example.com") as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  fireEvent.click(screen.getByText("Add"));
}

describe("ShareReminderDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.invoke.mockReset();
    mocks.update.mockReset();
    mocks.selectResult.data = [];
    mocks.selectResult.error = null;
    mocks.invokeResult.data = { shared: 0, skipped: 0 };
    mocks.invokeResult.error = null;
    mocks.updateResult.error = null;
    mocks.invoke.mockImplementation(async () => mocks.invokeResult);
  });

  it("rejects invalid emails", async () => {
    renderDialog();
    await waitFor(() => expect(screen.getByText("No active shares")).toBeInTheDocument());

    await addEmail("not-an-email");
    expect(toast.error).toHaveBeenCalledWith("Enter a valid email");
    expect(screen.queryByLabelText(/Remove not-an-email/)).not.toBeInTheDocument();
  });

  it("adds a valid email to the pending chips", async () => {
    renderDialog();
    await waitFor(() => screen.getByText("No active shares"));

    await addEmail("alice@example.com");
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("9 of 10 slots remaining")).toBeInTheDocument();
  });

  it("blocks duplicate pending emails", async () => {
    renderDialog();
    await waitFor(() => screen.getByText("No active shares"));

    await addEmail("alice@example.com");
    await addEmail("alice@example.com");
    expect(toast.error).toHaveBeenCalledWith("Already added");
  });

  it("blocks emails already actively shared", async () => {
    renderDialog([
      { id: "s1", recipient_email: "alice@example.com", created_at: "2026-01-01" },
    ]);
    await waitFor(() =>
      expect(screen.getByLabelText(/Revoke share with alice@example.com/)).toBeInTheDocument(),
    );

    await addEmail("alice@example.com");
    expect(toast.error).toHaveBeenCalledWith("Already shared with this email");
  });

  it("enforces the 10-recipient cap across active + pending", async () => {
    const active = Array.from({ length: 9 }, (_, i) => ({
      id: `s${i}`,
      recipient_email: `user${i}@example.com`,
      created_at: "2026-01-01",
    }));
    renderDialog(active);
    await waitFor(() =>
      expect(screen.getByLabelText(/Revoke share with user0@example.com/)).toBeInTheDocument(),
    );

    // First pending email fills the last slot.
    await addEmail("new1@example.com");
    expect(screen.getByText("0 of 10 slots remaining")).toBeInTheDocument();

    // Once the cap is hit, the input + Add button must be disabled so users
    // can't even attempt to add another recipient.
    const input = screen.getByPlaceholderText("email@example.com") as HTMLInputElement;
    const addButton = screen.getByText("Add").closest("button")!;
    expect(input).toBeDisabled();
    expect(addButton).toBeDisabled();
  });

  it("invokes share-reminder edge function with pending emails", async () => {
    mocks.invokeResult.data = { shared: 2, skipped: 0 };
    renderDialog();
    await waitFor(() => screen.getByText("No active shares"));

    await addEmail("a@x.com");
    await addEmail("b@x.com");
    fireEvent.click(screen.getByText("Share"));

    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1));
    expect(mocks.invoke).toHaveBeenCalledWith("share-reminder", {
      body: { reminderId: REMINDER_ID, recipientEmails: ["a@x.com", "b@x.com"] },
    });
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Shared with 2 people"),
    );
  });

  it("revokes an active share via supabase update", async () => {
    renderDialog([
      { id: "s1", recipient_email: "alice@example.com", created_at: "2026-01-01" },
    ]);
    await waitFor(() =>
      expect(screen.getByLabelText(/Revoke share with alice@example.com/)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText(/Revoke share with alice@example.com/));

    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    const updateArg = mocks.update.mock.calls[0][0];
    expect(updateArg).toHaveProperty("revoked_at");
    expect(typeof updateArg.revoked_at).toBe("string");
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Stopped sharing with alice@example.com"),
    );
  });

  it("requires at least one email to submit", async () => {
    renderDialog();
    await waitFor(() => screen.getByText("No active shares"));

    // Share button is disabled with no pending emails — sanity-check that.
    const shareBtn = screen.getByText("Share").closest("button")!;
    expect(shareBtn).toBeDisabled();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
});
