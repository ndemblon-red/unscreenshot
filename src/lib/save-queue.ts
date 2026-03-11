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

export function enqueue(item: QueuedSave) {
  memoryQueue.push(item);
  // Persist metadata (not File objects) so we can show count on reload
  try {
    const meta = memoryQueue.map(({ id, title, category, deadline }) => ({ id, title, category, deadline }));
    localStorage.setItem(QUEUE_KEY, JSON.stringify(meta));
  } catch {}
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

  return { saved, failed };
}
