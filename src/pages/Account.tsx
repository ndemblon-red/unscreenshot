import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, LogOut } from "lucide-react";
import StatsCards from "@/components/account/StatsCards";
import CategoryChart from "@/components/account/CategoryChart";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";
import NotificationList from "@/components/account/NotificationList";

interface Stats {
  total: number;
  completed: number;
  byCategory: Record<string, number>;
}

export default function Account() {
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
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

      <StatsCards
        total={stats?.total ?? 0}
        completed={stats?.completed ?? 0}
        loading={statsLoading}
      />

      <CategoryChart
        byCategory={stats?.byCategory ?? {}}
        loading={statsLoading}
      />

      <ChangePasswordForm />

      <NotificationList />
    </div>
  );
}
