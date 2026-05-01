import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

// GDPR right-to-erasure endpoint.
// Authenticated user can permanently delete their account and all associated data.
// Cascade order: storage objects → reminders → reminder_shares → notification_log
// → notification_preferences → analysis_usage → auth user.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate the caller's JWT by reading the user from their token.
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    // 1. Delete storage objects under {user_id}/...
    const { data: files } = await admin.storage.from("screenshots").list(userId, { limit: 1000 });
    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      const { error: rmErr } = await admin.storage.from("screenshots").remove(paths);
      if (rmErr) console.error("Storage cleanup partial failure:", rmErr);
    }

    // 2. Delete database rows (RLS bypassed via service role).
    await admin.from("reminders").delete().eq("user_id", userId);
    await admin.from("reminder_shares").delete().eq("shared_by_user_id", userId);
    await admin.from("notification_log").delete().eq("user_id", userId);
    await admin.from("notification_preferences").delete().eq("user_id", userId);
    await admin.from("analysis_usage").delete().eq("user_id", userId);

    // 3. Delete the auth user last.
    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
    if (deleteErr) {
      console.error("Auth user deletion failed:", deleteErr);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("delete-account unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
