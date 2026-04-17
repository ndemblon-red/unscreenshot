import { useEffect, useState } from "react";
import { Bell, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Prefs = { email_enabled: boolean; web_enabled: boolean };

type PermissionState = NotificationPermission | "unsupported";

function getPermission(): PermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export default function NotificationPreferences() {
  const [userId, setUserId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({ email_enabled: true, web_enabled: false });
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<PermissionState>(() => getPermission());

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("email_enabled, web_enabled")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) console.error("Failed to load preferences", error);
      if (data) setPrefs({ email_enabled: data.email_enabled, web_enabled: data.web_enabled });
      setLoading(false);
    }
    load();
  }, []);

  async function persist(next: Prefs) {
    if (!userId) return;
    setPrefs(next);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert(
        { user_id: userId, email_enabled: next.email_enabled, web_enabled: next.web_enabled },
        { onConflict: "user_id" },
      );
    if (error) {
      console.error("Failed to save preferences", error);
      toast.error("Couldn't save preferences");
    }
  }

  async function handleEmailToggle(checked: boolean) {
    await persist({ ...prefs, email_enabled: checked });
  }

  async function handleWebToggle(checked: boolean) {
    if (!checked) {
      await persist({ ...prefs, web_enabled: false });
      return;
    }

    if (permission === "unsupported") {
      toast.error("Browser notifications aren't supported here");
      return;
    }

    if (permission === "denied") {
      toast.error("Notifications blocked. Enable them in browser settings.");
      return;
    }

    if (permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        toast.error("Permission not granted");
        return;
      }
    }

    await persist({ ...prefs, web_enabled: true });
  }

  return (
    <section className="mt-10">
      <h2 className="text-section-title tracking-tight mb-4">Notifications</h2>
      <div className="space-y-4 rounded-card border border-border p-5 bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-[15px] font-medium text-foreground">Email reminders</p>
              <p className="text-label text-muted-foreground mt-0.5">
                Sent the day a reminder is due.
              </p>
            </div>
          </div>
          <Switch
            checked={prefs.email_enabled}
            onCheckedChange={handleEmailToggle}
            disabled={loading}
            aria-label="Email reminders"
          />
        </div>

        <div className="border-t border-border" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-[15px] font-medium text-foreground">Browser notifications</p>
              <p className="text-label text-muted-foreground mt-0.5">
                System alerts while this app is open in a tab.
              </p>
              {permission === "denied" && (
                <p className="text-label text-destructive mt-1.5">
                  Blocked by your browser. Enable notifications in site settings to turn this on.
                </p>
              )}
              {permission === "unsupported" && (
                <p className="text-label text-destructive mt-1.5">
                  Not supported in this browser.
                </p>
              )}
            </div>
          </div>
          <Switch
            checked={prefs.web_enabled && permission === "granted"}
            onCheckedChange={handleWebToggle}
            disabled={loading || permission === "unsupported" || permission === "denied"}
            aria-label="Browser notifications"
          />
        </div>
      </div>
    </section>
  );
}
