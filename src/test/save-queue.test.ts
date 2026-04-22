import { describe, it, expect, beforeEach, vi } from "vitest";

// Hoisted mocks for the supabase client used by save-queue.
const mocks = vi.hoisted(() => {
  return {
    getSession: vi.fn(),
    storageUpload: vi.fn(),
    getPublicUrl: vi.fn(),
    fromInsert: vi.fn(),
  };
});

vi.mock("@/integrations/supabase/client", () => {
  return {
    supabase: {
      auth: { getSession: mocks.getSession },
      storage: {
        from: () => ({
          upload: mocks.storageUpload,
          getPublicUrl: mocks.getPublicUrl,
        }),
      },
      from: () => ({ insert: mocks.fromInsert }),
    },
  };
});

import {
  enqueue,
  getQueue,
  clearQueue,
  flushQueue,
  subscribeQueueCount,
  type QueuedSave,
} from "@/lib/save-queue";

function makeItem(id: string, overrides: Partial<QueuedSave> = {}): QueuedSave {
  return {
    id,
    file: new File(["content"], `${id}.jpg`, { type: "image/jpeg" }),
    mimeType: "image/jpeg",
    title: `Title ${id}`,
    category: "To Do",
    deadline: "2026-04-22T09:00",
    ...overrides,
  };
}

describe("save-queue", () => {
  beforeEach(() => {
    clearQueue();
    localStorage.clear();
    mocks.getSession.mockReset();
    mocks.storageUpload.mockReset();
    mocks.getPublicUrl.mockReset();
    mocks.fromInsert.mockReset();
  });

  it("enqueue adds items and persists metadata to localStorage", () => {
    enqueue(makeItem("a"));
    enqueue(makeItem("b"));
    expect(getQueue()).toHaveLength(2);
    const stored = JSON.parse(localStorage.getItem("unscreenshot_save_queue_meta") ?? "[]");
    expect(stored).toHaveLength(2);
    expect(stored[0]).toMatchObject({ id: "a", title: "Title a" });
    // File objects should NOT be persisted (only metadata).
    expect(stored[0]).not.toHaveProperty("file");
  });

  it("subscribeQueueCount notifies on enqueue and unsubscribes cleanly", () => {
    const observed: number[] = [];
    const unsub = subscribeQueueCount((n) => observed.push(n));
    expect(observed).toEqual([0]); // initial fire

    enqueue(makeItem("a"));
    enqueue(makeItem("b"));
    expect(observed).toEqual([0, 1, 2]);

    unsub();
    enqueue(makeItem("c"));
    expect(observed).toEqual([0, 1, 2]); // no new entry after unsubscribe
  });

  it("flushQueue returns 0/0 when empty", async () => {
    const result = await flushQueue();
    expect(result).toEqual({ saved: 0, failed: 0 });
  });

  it("flushQueue saves all items on success and clears the queue", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
    });
    mocks.storageUpload.mockResolvedValue({ error: null });
    mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: "https://x/img.jpg" } });
    mocks.fromInsert.mockResolvedValue({ error: null });

    enqueue(makeItem("a"));
    enqueue(makeItem("b"));

    const result = await flushQueue();
    expect(result).toEqual({ saved: 2, failed: 0 });
    expect(getQueue()).toHaveLength(0);
    expect(localStorage.getItem("unscreenshot_save_queue_meta")).toBeNull();
  });

  it("flushQueue keeps failed items in the queue and reports the count", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
    });
    mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: "https://x/img.jpg" } });
    // First upload succeeds, second fails.
    mocks.storageUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "boom" } });
    mocks.fromInsert.mockResolvedValue({ error: null });

    enqueue(makeItem("a"));
    enqueue(makeItem("b"));

    const result = await flushQueue();
    expect(result).toEqual({ saved: 1, failed: 1 });
    const remaining = getQueue();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe("b");
  });

  it("flushQueue treats missing session as failure", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    enqueue(makeItem("a"));

    const result = await flushQueue();
    expect(result).toEqual({ saved: 0, failed: 1 });
    expect(getQueue()).toHaveLength(1);
  });
});
