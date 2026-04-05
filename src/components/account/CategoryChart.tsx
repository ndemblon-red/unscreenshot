import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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

interface CategoryChartProps {
  byCategory: Record<string, number>;
  loading: boolean;
}

export default function CategoryChart({ byCategory, loading }: CategoryChartProps) {
  if (loading) {
    return (
      <div className="border border-border rounded-btn p-5 mb-6">
        <h2 className="text-card-title mb-4">By Category</h2>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const entries = Object.entries(byCategory);

  if (entries.length === 0) {
    return (
      <div className="border border-border rounded-btn p-5 mb-6">
        <h2 className="text-card-title mb-4">By Category</h2>
        <p className="text-label text-muted-foreground">No reminders yet</p>
      </div>
    );
  }

  const chartData = entries
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => ({
      name: cat,
      value: count,
      color: CATEGORY_COLORS[cat] ?? "hsl(var(--muted))",
    }));

  const totalCount = chartData.reduce((sum, d) => sum + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {Math.round(percent * 100)}%
      </text>
    );
  };

  return (
    <div className="border border-border rounded-btn p-5 mb-6">
      <h2 className="text-card-title mb-4">By Category</h2>
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
                label={renderLabel}
                labelLine={false}
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
              <span className="text-[13px] font-medium text-foreground ml-auto">
                {item.value} · {Math.round((item.value / totalCount) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
