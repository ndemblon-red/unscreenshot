import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface Stats {
  generatedAt: string;
  users: { total: number; last7d: number; last30d: number };
  reminders: { total: number; active: number };
  analyses: { total: number; last7d: number };
  retention: { cohortSize: number; week2Retained: number; window: string };
  shares: { active: number };
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.functions.invoke("admin-stats").then(({ data, error }) => {
      if (error) setError(error.message);
      else setStats(data as Stats);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin stats</h1>
          <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground">
            Back to app
          </Link>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {!stats && !error && <p className="text-sm text-muted-foreground">Loading…</p>}

        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Total users" value={stats.users.total} />
            <Stat label="New users (7d)" value={stats.users.last7d} />
            <Stat label="New users (30d)" value={stats.users.last30d} />
            <Stat label="Active reminders" value={stats.reminders.active} />
            <Stat label="Total reminders" value={stats.reminders.total} />
            <Stat label="Total analyses" value={stats.analyses.total} />
            <Stat label="Analyses (7d)" value={stats.analyses.last7d} />
            <Stat label="Active shares" value={stats.shares.active} />
            <Stat
              label="Week-2 retention"
              value={`${stats.retention.week2Retained} / ${stats.retention.cohortSize}`}
              sub={stats.retention.window}
            />
          </div>
        )}

        {stats && (
          <p className="text-xs text-muted-foreground">
            Generated {new Date(stats.generatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}
