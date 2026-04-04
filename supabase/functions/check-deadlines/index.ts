import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.98.0/cors";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get today and tomorrow as YYYY-MM-DD strings
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);

    // Fetch reminders due today or tomorrow that are still active (status = 'next')
    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select("id, user_id, title, deadline, category")
      .eq("status", "next")
      .in("deadline", [today, tomorrow]);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      return new Response(JSON.stringify({ error: remindersError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: "No due reminders", notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch existing notifications to deduplicate
    const reminderIds = reminders.map((r) => r.id);
    const { data: existingLogs, error: logsError } = await supabase
      .from("notification_log")
      .select("reminder_id, notification_type")
      .in("reminder_id", reminderIds)
      .in("notification_type", ["due_today", "due_tomorrow"]);

    if (logsError) {
      console.error("Error fetching existing logs:", logsError);
      return new Response(JSON.stringify({ error: logsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const alreadyNotified = new Set(
      (existingLogs || []).map((l) => `${l.reminder_id}:${l.notification_type}`)
    );

    // Look up user emails
    const userIds = [...new Set(reminders.map((r) => r.user_id).filter(Boolean))];
    const emailMap: Record<string, string> = {};
    for (const uid of userIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(uid);
      if (userData?.user?.email) {
        emailMap[uid] = userData.user.email;
      }
    }

    // Build notification entries
    const entries: Array<{
      reminder_id: string;
      user_id: string;
      recipient_email: string | null;
      notification_type: string;
      status: string;
    }> = [];

    for (const reminder of reminders) {
      if (!reminder.user_id) continue;

      const notificationType = reminder.deadline === today ? "due_today" : "due_tomorrow";
      const key = `${reminder.id}:${notificationType}`;

      if (alreadyNotified.has(key)) continue;

      entries.push({
        reminder_id: reminder.id,
        user_id: reminder.user_id,
        recipient_email: emailMap[reminder.user_id] || null,
        notification_type: notificationType,
        status: "logged",
      });
    }

    if (entries.length === 0) {
      return new Response(JSON.stringify({ message: "All already notified", notified: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertError } = await supabase
      .from("notification_log")
      .insert(entries);

    if (insertError) {
      console.error("Error inserting notifications:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Logged ${entries.length} notifications`);
    return new Response(JSON.stringify({ message: "Success", notified: entries.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
