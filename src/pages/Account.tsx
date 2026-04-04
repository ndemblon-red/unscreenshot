import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, ArrowLeft, LogOut, Bell, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Stats {
  total: number;
  completed: number;
  byCategory: Record<string, number>;
}

interface NotificationEntry {
  id: string;
  reminder_id: string;
  notification_type: string;
  status: string;
  created_at: string;
  recipient_email: string | null;
}

export default function Account() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  useEffect(() => {
    async function loadStats() {
      const { data, error } = await supabase
        .from("reminders")
        .select("status, category");
      if (error) {
        console.error("Failed to load stats", error);
        setStatsLoading(false);
        return;
      }
      const total = data.length;
      const completed = data.filter((r) => r.status === "done").length;
      const byCategory: Record<string, number> = {};
      for (const r of data) {
        byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      }
      setStats({ total, completed, byCategory });
      setStatsLoading(false);
    }
    loadStats();
  }, []);

  const loadNotifications = async () => {
    setNotifLoading(true);
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
    setNotifLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-page-x py-page-y max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/app")}
          className="flex items-center gap-1.5 text-label text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/auth");
          }}
          className="p-2.5 rounded-btn text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <h1 className="text-page-title tracking-tight mb-1">Account</h1>
      <p className="text-label text-muted-foreground mb-8">{email}</p>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-border rounded-btn p-5">
          <p className="text-label text-muted-foreground mb-1">Total Reminders</p>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-page-title tracking-tight">{stats?.total ?? 0}</p>
          )}
        </div>
        <div className="border border-border rounded-btn p-5">
          <p className="text-label text-muted-foreground mb-1">Completed</p>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-page-title tracking-tight">{stats?.completed ?? 0}</p>
          )}
        </div>
      </div>

      <div className="border border-border rounded-btn p-5 mb-6">
        <h2 className="text-card-title mb-4">By Category</h2>
        {statsLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : stats && Object.keys(stats.byCategory).length > 0 ? (
          (() => {
            const CATEGORY_COLORS: Record<string, string> = {
              Events: "#5856D6",
              Shopping: "#FF9500",
              Restaurants: "#34C759",
              "To Do": "#007AFF",
              Reading: "#AF52DE",
              Home: "#FF6B35",
              Travel: "#32ADE6",
              Wishlist: "#FF2D55",
            };
            const chartData = Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => ({
                name: cat,
                value: count,
                color: CATEGORY_COLORS[cat] ?? "hsl(var(--muted))",
              }));
            return (
              <div className="flex items-center gap-6">
                <div className="w-[180px] h-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                        formatter={(value: number, name: string) => [value, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[13px] text-muted-foreground">{item.name}</span>
                      <span className="text-[13px] font-medium text-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()
        ) : (
          <p className="text-label text-muted-foreground">No reminders yet</p>
        )}
      </div>

      {/* Change Password */}
      <div className="border border-border rounded-btn p-5 mb-6">
        <h2 className="text-card-title mb-4">Change password</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-sm">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-3 py-2.5 rounded-btn border border-border bg-card text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 w-fit"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>

      {/* Recent Notifications */}
      <div className="border border-border rounded-btn p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-card-title">Recent Notifications</h2>
        </div>
        {notifLoading ? (
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
          <p className="text-label text-muted-foreground">No notifications yet. These will appear when reminders are approaching their deadlines.</p>
        )}
      </div>
    </div>
  );
}
