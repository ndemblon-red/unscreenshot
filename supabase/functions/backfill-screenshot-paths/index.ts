// One-shot backfill: move screenshots from flat paths to {user_id}/{filename}.
// Updates reminders.image_url to match. Idempotent — skips already-migrated rows.
// DELETE THIS FUNCTION AFTER SUCCESSFUL RUN.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-backfill-token',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Require a shared secret to invoke (prevents random callers).
  const auth = req.headers.get("x-backfill-token");
  if (auth !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response("forbidden", { status: 403, headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Fetch all reminders that have an image_url pointing at a flat-path object.
  const { data: reminders, error: remErr } = await admin
    .from("reminders")
    .select("id, user_id, image_url")
    .not("user_id", "is", null);

  if (remErr) {
    return new Response(JSON.stringify({ error: remErr.message }), { status: 500, headers: corsHeaders });
  }

  const results: Array<Record<string, unknown>> = [];

  for (const r of reminders ?? []) {
    if (!r.image_url || !r.user_id) continue;

    // Extract the storage path from the public URL.
    // Expected: .../storage/v1/object/public/screenshots/<path>
    const marker = "/screenshots/";
    const idx = r.image_url.indexOf(marker);
    if (idx === -1) {
      results.push({ id: r.id, skipped: "no /screenshots/ in url" });
      continue;
    }
    const oldPath = r.image_url.substring(idx + marker.length);

    // Skip if already migrated (path starts with the user_id).
    if (oldPath.startsWith(`${r.user_id}/`)) {
      results.push({ id: r.id, skipped: "already migrated" });
      continue;
    }

    const newPath = `${r.user_id}/${oldPath}`;

    // Move the file in storage.
    const { error: moveErr } = await admin.storage.from("screenshots").move(oldPath, newPath);
    if (moveErr) {
      results.push({ id: r.id, oldPath, error: `move failed: ${moveErr.message}` });
      continue;
    }

    // Build the new public URL.
    const { data: urlData } = admin.storage.from("screenshots").getPublicUrl(newPath);

    // Update the reminder.
    const { error: updErr } = await admin
      .from("reminders")
      .update({ image_url: urlData.publicUrl })
      .eq("id", r.id);

    if (updErr) {
      // Best effort: try to move the file back to keep things consistent.
      await admin.storage.from("screenshots").move(newPath, oldPath);
      results.push({ id: r.id, oldPath, error: `db update failed (rolled back): ${updErr.message}` });
      continue;
    }

    results.push({ id: r.id, oldPath, newPath, ok: true });
  }

  const summary = {
    total: results.length,
    migrated: results.filter((r) => r.ok).length,
    skipped: results.filter((r) => r.skipped).length,
    errored: results.filter((r) => r.error).length,
  };

  return new Response(JSON.stringify({ summary, results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
