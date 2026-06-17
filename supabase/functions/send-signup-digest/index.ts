import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";

const RECIPIENT = "ndemblon@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "1";

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sinceIso = since.toISOString();

    // Page through all users (admin API caps perPage at 1000)
    const allUsers: { email: string | undefined; created_at: string }[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data?.users ?? [];
      for (const u of users) {
        allUsers.push({ email: u.email, created_at: u.created_at });
      }
      if (users.length < perPage) break;
      page++;
      if (page > 50) break; // safety
    }

    const recent = allUsers
      .filter((u) => u.created_at && new Date(u.created_at) >= since && u.email)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((u) => ({ email: u.email!, createdAt: u.created_at }));

    if (recent.length === 0 && !force) {
      return new Response(
        JSON.stringify({ message: "No new signups", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const dayKey = new Date().toISOString().slice(0, 10);
    const { error: sendError } = await supabase.functions.invoke(
      "send-transactional-email",
      {
        body: {
          templateName: "signup-digest",
          recipientEmail: RECIPIENT,
          idempotencyKey: `signup-digest-${dayKey}`,
          templateData: {
            signups: recent,
            totalUsers: allUsers.length,
            periodLabel: "last 24 hours",
          },
        },
      },
    );

    if (sendError) {
      console.error("send failed:", sendError);
      return new Response(
        JSON.stringify({ error: sendError.message ?? "send failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ message: "Sent", count: recent.length, totalUsers: allUsers.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
