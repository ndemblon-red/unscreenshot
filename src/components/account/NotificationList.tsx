import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Bell, RefreshCw } from "lucide-react";

interface NotificationEntry {
  id: string;
  reminder_id: string;
  notification_type: string;
  status: string;
  created_at: string;
  recipient_email: string | null;
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notification_log")
      .select("id, reminder_id, notification_type, status, created_at, recipient_email")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      console.error("Failed to load notifications", error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="border border-border rounded-btn p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-card-title">Recent Notifications</h2>
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto p-1.5 rounded-btn text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Refresh notifications"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] text-foreground">
                  {n.notification_type === "due_today" ? "Due today" : "Due tomorrow"}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleDateString()} · {n.recipient_email || "No email"}
                </span>
              </div>
              <Badge
                variant={n.status === "sent" ? "default" : n.status === "failed" ? "destructive" : "secondary"}
                className="text-[11px]"
              >
                {n.status}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-label text-muted-foreground">
          No notifications yet. These will appear when reminders are approaching their deadlines.
        </p>
      )}
    </div>
  );
}
