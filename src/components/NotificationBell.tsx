import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  reminder_id: string;
  notification_type: string;
  status: string;
  created_at: string;
  read: boolean;
  reminder_title?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notification_log")
      .select("id, reminder_id, notification_type, status, created_at, read")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to fetch notifications:", error);
      return;
    }

    if (!data || data.length === 0) {
      setNotifications([]);
      return;
    }

    // Fetch reminder titles
    const reminderIds = [...new Set(data.map((n) => n.reminder_id))];
    const { data: reminders } = await supabase
      .from("reminders")
      .select("id, title")
      .in("id", reminderIds);

    const titleMap = new Map(reminders?.map((r) => [r.id, r.title]) ?? []);

    setNotifications(
      data.map((n) => ({
        ...n,
        reminder_title: titleMap.get(n.reminder_id) ?? "Deleted reminder",
      }))
    );
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notification_log_bell")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notification_log" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notification_log")
      .update({ read: true })
      .in("id", unreadIds);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleClickNotification = async (n: Notification) => {
    if (!n.read) {
      await supabase
        .from("notification_log")
        .update({ read: true })
        .eq("id", n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
    }
    setOpen(false);
    navigate(`/reminder/${n.reminder_id}`);
  };

  const typeLabel = (type: string) =>
    type === "due_today" ? "Due today" : "Due tomorrow";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2.5 rounded-btn text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[11px] font-medium px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-[15px] font-medium text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[13px] text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        {notifications.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClickNotification(n)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors ${
                  !n.read ? "bg-accent/30" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                  <div className={!n.read ? "" : "pl-4"}>
                    <p className="text-[14px] text-foreground leading-tight">
                      {typeLabel(n.notification_type)}
                    </p>
                    <p className="text-[13px] text-muted-foreground truncate">
                      {n.reminder_title}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-[14px] text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
