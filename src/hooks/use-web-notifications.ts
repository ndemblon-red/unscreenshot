import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to new rows in `notification_log` for the current user and
 * surfaces them as native browser notifications when permission and the
 * `web_enabled` preference are both granted.
 */
export function useWebNotifications() {
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function setup() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId || cancelled) return;

      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("web_enabled")
        .eq("user_id", userId)
        .maybeSingle();

      if (!prefs?.web_enabled) return;
      if (Notification.permission !== "granted") return;

      channel = supabase
        .channel(`web-notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notification_log",
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            const row = payload.new as {
              reminder_id: string;
              notification_type: string;
            };
            const { data: reminder } = await supabase
              .from("reminders")
              .select("title")
              .eq("id", row.reminder_id)
              .maybeSingle();

            const heading =
              row.notification_type === "due_today" ? "Due today" : "Due tomorrow";
            const body = reminder?.title ?? "Reminder";

            try {
              const n = new Notification(heading, {
                body,
                icon: "/icon.svg",
                tag: `reminder-${row.reminder_id}`,
              });
              n.onclick = () => {
                window.focus();
                window.location.assign(`/reminder/${row.reminder_id}`);
                n.close();
              };
            } catch (err) {
              console.error("Failed to show notification", err);
            }
          },
        )
        .subscribe();
    }

    setup();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);
}
