import { supabase } from "@/integrations/supabase/client";

export interface QueuedSave {
  id: string;
  file: File;
  mimeType: string;
  title: string;
  category: string;
  deadline: string;
}

const QUEUE_KEY = "unscreenshot_save_queue_meta";
let memoryQueue: QueuedSave[] = [];
type Listener = (count: number) => void;
const listeners: Listener[] = [];

function notify() {
  listeners.forEach((l) => l(memoryQueue.length));
}

export function subscribeQueueCount(fn: Listener): () => void {
  listeners.push(fn);
  fn(memoryQueue.length);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

export function enqueue(item: QueuedSave) {
  memoryQueue.push(item);
  try {
    const meta = memoryQueue.map(({ id, title, category, deadline }) => ({ id, title, category, deadline }));
    localStorage.setItem(QUEUE_KEY, JSON.stringify(meta));
  } catch {}
  notify();
}

export function getQueue(): QueuedSave[] {
  return [...memoryQueue];
}

export function clearQueue() {
  memoryQueue = [];
  try { localStorage.removeItem(QUEUE_KEY); } catch {}
}

export async function flushQueue(): Promise<{ saved: number; failed: number }> {
  const items = [...memoryQueue];
  if (items.length === 0) return { saved: 0, failed: 0 };

  let saved = 0;
  let failed = 0;
  const remaining: QueuedSave[] = [];

  for (const item of items) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const ext = item.file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(path, item.file, { contentType: item.mimeType });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path);

      const { error: dbError } = await supabase.from("reminders").insert({
        title: item.title || "Review this item",
        category: item.category,
        deadline: item.deadline,
        image_url: urlData.publicUrl,
        status: "next",
        user_id: session.user.id,
      });
      if (dbError) throw dbError;
      saved++;
    } catch (err) {
      console.error("Queue flush failed for item:", item.id, err);
      remaining.push(item);
      failed++;
    }
  }

  memoryQueue = remaining;
  try {
    if (remaining.length === 0) localStorage.removeItem(QUEUE_KEY);
    else {
      const meta = remaining.map(({ id, title, category, deadline }) => ({ id, title, category, deadline }));
      localStorage.setItem(QUEUE_KEY, JSON.stringify(meta));
    }
  } catch {}
  notify();

  return { saved, failed };
}
