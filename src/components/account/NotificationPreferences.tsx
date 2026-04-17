import { useEffect, useMemo, useState } from "react";
import { Bell, Mail, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Prefs = {
  email_enabled: boolean;
  email_due_tomorrow: boolean;
  email_due_today: boolean;
  web_enabled: boolean;
  timezone: string;
};

type PermissionState = NotificationPermission | "unsupported";

function getPermission(): PermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

const COMMON_TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function NotificationPreferences() {
  const [userId, setUserId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({
    email_enabled: true,
    email_due_tomorrow: true,
    email_due_today: true,
    web_enabled: false,
    timezone: detectBrowserTimezone(),
  });
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<PermissionState>(() => getPermission());

  const tzOptions = useMemo(() => {
    const detected = detectBrowserTimezone();
    const set = new Set(COMMON_TIMEZONES);
    if (detected) set.add(detected);
    if (prefs.timezone) set.add(prefs.timezone);
    return Array.from(set).sort();
  }, [prefs.timezone]);

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
        .select("email_enabled, email_due_tomorrow, email_due_today, web_enabled, timezone")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) console.error("Failed to load preferences", error);
      if (data) {
        const detected = detectBrowserTimezone();
        const tz = data.timezone && data.timezone !== "UTC" ? data.timezone : detected;
        setPrefs({
          email_enabled: data.email_enabled,
          email_due_tomorrow: data.email_due_tomorrow ?? true,
          email_due_today: data.email_due_today ?? true,
          web_enabled: data.web_enabled,
          timezone: tz,
        });
        if (tz !== data.timezone) {
          await supabase
            .from("notification_preferences")
            .upsert(
              {
                user_id: uid,
                email_enabled: data.email_enabled,
                email_due_tomorrow: data.email_due_tomorrow ?? true,
                email_due_today: data.email_due_today ?? true,
                web_enabled: data.web_enabled,
                timezone: tz,
              },
              { onConflict: "user_id" },
            );
        }
      } else {
        const detected = detectBrowserTimezone();
        setPrefs((p) => ({ ...p, timezone: detected }));
      }
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
        {
          user_id: userId,
          email_enabled: next.email_enabled,
          web_enabled: next.web_enabled,
          timezone: next.timezone,
        },
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

  async function handleTimezoneChange(value: string) {
    await persist({ ...prefs, timezone: value });
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
                Sent at 6 PM the day before, and 8 AM the day a reminder is due.
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

        <div className="border-t border-border" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Globe className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-foreground">Timezone</p>
              <p className="text-label text-muted-foreground mt-0.5">
                Used to send emails at your local 6 PM and 8 AM.
              </p>
            </div>
          </div>
          <Select
            value={prefs.timezone}
            onValueChange={handleTimezoneChange}
            disabled={loading}
          >
            <SelectTrigger className="w-[200px]" aria-label="Timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {tzOptions.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
