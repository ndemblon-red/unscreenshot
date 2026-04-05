import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  total: number;
  completed: number;
  loading: boolean;
}

export default function StatsCards({ total, completed, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="border border-border rounded-btn p-5">
        <p className="text-label text-muted-foreground mb-1">Total Reminders</p>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-page-title tracking-tight">{total}</p>
        )}
      </div>
      <div className="border border-border rounded-btn p-5">
        <p className="text-label text-muted-foreground mb-1">Completed</p>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-page-title tracking-tight">{completed}</p>
        )}
      </div>
    </div>
  );
}
