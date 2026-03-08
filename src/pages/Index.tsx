import { useState } from "react";
import { Upload, ArrowUpDown, ImageIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CategoryPills from "@/components/CategoryPills";
import TaskCard, { TaskCardProps } from "@/components/TaskCard";

// Mock data for static UI milestone
const MOCK_TASKS: Omit<TaskCardProps, "onMarkDone" | "onDelete" | "onClick">[] = [
  {
    id: "1",
    title: "Buy tickets for Massive Attack",
    category: "Events",
    deadline: "14 June",
    imageUrl: "/placeholder.svg",
    status: "next",
  },
  {
    id: "2",
    title: "Try Bancone in Covent Garden",
    category: "Restaurants",
    deadline: "Next Month",
    imageUrl: "/placeholder.svg",
    status: "next",
  },
  {
    id: "3",
    title: "Buy Nike Air Max trainers",
    category: "Shopping",
    deadline: "Next Week",
    imageUrl: "/placeholder.svg",
    status: "next",
  },
  {
    id: "4",
    title: "Read article on design systems",
    category: "Reading",
    deadline: "Tomorrow",
    imageUrl: "/placeholder.svg",
    status: "done",
  },
  {
    id: "5",
    title: "Book flights to Lisbon",
    category: "Travel",
    deadline: "Next Month",
    imageUrl: "/placeholder.svg",
    status: "archive",
  },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState("next");
  const [selectedCategory, setSelectedCategory] = useState("Everything");
  const [sortNewest, setSortNewest] = useState(true);

  const filteredTasks = MOCK_TASKS.filter((t) => {
    if (t.status !== activeTab) return false;
    if (selectedCategory !== "Everything" && t.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background px-page-x py-page-y max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-page-title tracking-tight">Unscreenshot</h1>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity">
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
            <CategoryPills
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
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
                    onMarkDone={(id) => console.log("Mark done:", id)}
                    onDelete={(id) => console.log("Delete:", id)}
                    onClick={(id) => console.log("Open:", id)}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ImageIcon className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-card-title text-foreground mb-1">No reminders here</p>
                <p className="text-label text-muted-foreground mb-6">
                  Upload a screenshot to create your first reminder
                </p>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity">
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
