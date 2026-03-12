import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowUpDown, ImageIcon, LogOut } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CategoryPills from "@/components/CategoryPills";
import TaskCard, { TaskCardProps } from "@/components/TaskCard";
import { supabase } from "@/integrations/supabase/client";

type Reminder = {
  id: string;
  title: string;
  category: string;
  deadline: string;
  image_url: string;
  status: string;
};

export default function Index() {
  const [activeTab, setActiveTab] = useState("next");
  const [selectedCategory, setSelectedCategory] = useState("Everything");
  const [sortNewest, setSortNewest] = useState(true);
  const [tasks, setTasks] = useState<Omit<TaskCardProps, "onMarkDone" | "onDelete" | "onClick">[]>([]);
  const navigate = useNavigate();

  // Auto-archive expired reminders then fetch
  useEffect(() => {
    const fetchReminders = async () => {
      const today = new Date().toISOString().split("T")[0];

      // Move overdue "next" reminders to archive
      await supabase
        .from("reminders")
        .update({ status: "archive" })
        .eq("status", "next")
        .lt("deadline", today);

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch reminders:", error);
        return;
      }

      if (data) {
        setTasks(
          data.map((r: Reminder) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            deadline: r.deadline,
            imageUrl: r.image_url,
            status: r.status as "next" | "done" | "archive",
          }))
        );
      }
    };

    fetchReminders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("reminders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reminders" },
        () => {
          fetchReminders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredTasks = tasks
    .filter((t) => {
      if (t.status !== activeTab) return false;
      if (selectedCategory !== "Everything" && t.category !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => {
      const diff = a.deadline.localeCompare(b.deadline);
      return sortNewest ? diff : -diff;
    });

  const handleMarkDone = async (id: string) => {
    const { error } = await supabase
      .from("reminders")
      .update({ status: "done" })
      .eq("id", id);
    if (error) console.error("Mark done failed:", error);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id);
    if (error) console.error("Delete failed:", error);
  };

  return (
    <div className="min-h-screen bg-background px-page-x py-page-y max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-page-title tracking-tight">Unscreenshot</h1>
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          Upload Screenshots
        </button>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start bg-transparent gap-0 border-b border-border rounded-none p-0 h-auto mb-4">
          {["next", "done", "archive"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-[15px] font-medium text-muted-foreground data-[state=active]:text-foreground"
            >
              {tab === "next" ? "Next" : tab === "done" ? "Done" : "Archive"}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Category pills + Sort */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 overflow-hidden">
            <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />
          </div>
          <button
            onClick={() => setSortNewest(!sortNewest)}
            className="flex items-center gap-1.5 text-label text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortNewest ? "Newest" : "Oldest"}
          </button>
        </div>

        {/* Task list content for each tab */}
        {["next", "done", "archive"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            {filteredTasks.length > 0 ? (
              <div className="flex flex-col gap-card-gap">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    {...task}
                    onMarkDone={handleMarkDone}
                    onDelete={handleDelete}
                    onClick={(id) => navigate(`/reminder/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ImageIcon className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-card-title text-foreground mb-1">No reminders here</p>
                <p className="text-label text-muted-foreground mb-6">
                  Upload a screenshot to create your first reminder
                </p>
                <button
                  onClick={() => navigate("/upload")}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity"
                >
                  <Upload className="w-4 h-4" />
                  Upload your first screenshot
                </button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
