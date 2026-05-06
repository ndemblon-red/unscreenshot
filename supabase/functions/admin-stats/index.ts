import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";

// Hard-coded single-admin allowlist. See DECISIONS.md (May 2026 — Admin
// stats: hardcoded email allowlist) for the rationale and the path to a
// proper user_roles table.
const ADMIN_EMAILS = new Set(["ndemblon@gmail.com"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate caller via JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const email = (userData.user.email ?? "").toLowerCase();
    if (!ADMIN_EMAILS.has(email)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const dayMs = 86400000;
    const sevenDaysAgo = new Date(now.getTime() - 7 * dayMs).toISOString();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * dayMs).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * dayMs).toISOString();

    // Total users
    const { data: usersList, error: usersErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (usersErr) throw usersErr;
    const allUsers = usersList?.users ?? [];
    const totalUsers = allUsers.length;
    const usersLast7d = allUsers.filter((u) => u.created_at && u.created_at >= sevenDaysAgo).length;
    const usersLast30d = allUsers.filter((u) => u.created_at && u.created_at >= thirtyDaysAgo).length;

    // Reminders
    const { count: totalReminders } = await admin
      .from("reminders")
      .select("*", { count: "exact", head: true });
    const { count: activeReminders } = await admin
      .from("reminders")
      .select("*", { count: "exact", head: true })
      .eq("status", "next");

    // Analyses
    const { count: totalAnalyses } = await admin
      .from("analysis_usage")
      .select("*", { count: "exact", head: true });
    const { count: analysesLast7d } = await admin
      .from("analysis_usage")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    // Week-2 retention: users who signed up 14–7 days ago AND have at least
    // one analysis in the last 7 days. Quick proxy for "still using it".
    const { data: cohort } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const cohortIds = (cohort?.users ?? [])
      .filter((u) => u.created_at && u.created_at >= fourteenDaysAgo && u.created_at < sevenDaysAgo)
      .map((u) => u.id);
    let week2Retained = 0;
    if (cohortIds.length > 0) {
      const { data: returnRows } = await admin
        .from("analysis_usage")
        .select("user_id")
        .in("user_id", cohortIds)
        .gte("created_at", sevenDaysAgo);
      const returners = new Set((returnRows ?? []).map((r) => r.user_id));
      week2Retained = returners.size;
    }

    // Shares
    const { count: activeShares } = await admin
      .from("reminder_shares")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null);

    return new Response(
      JSON.stringify({
        generatedAt: now.toISOString(),
        users: {
          total: totalUsers,
          last7d: usersLast7d,
          last30d: usersLast30d,
        },
        reminders: {
          total: totalReminders ?? 0,
          active: activeReminders ?? 0,
        },
        analyses: {
          total: totalAnalyses ?? 0,
          last7d: analysesLast7d ?? 0,
        },
        retention: {
          cohortSize: cohortIds.length,
          week2Retained,
          window: "signed up 7-14d ago, analysed in last 7d",
        },
        shares: {
          active: activeShares ?? 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("admin-stats error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
