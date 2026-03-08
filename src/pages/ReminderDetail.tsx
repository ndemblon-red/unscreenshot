import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Trash2, Clock, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { getCategoryClasses } from "@/lib/categories";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";

type Reminder = {
  id: string;
  title: string;
  category: string;
  deadline: string;
  image_url: string;
  status: string;
  created_at: string;
};

const DEADLINE_OPTIONS = ["Tomorrow", "Next Week", "Next Month"];
const EDITABLE_CATEGORIES = CATEGORIES.filter((c) => c !== "Everything");

const isCustomDate = (d: string) =>
  !DEADLINE_OPTIONS.includes(d) && /^\d{4}-\d{2}-\d{2}$/.test(d);

export default function ReminderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Editable fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        console.error("Failed to fetch reminder:", error);
        navigate("/");
        return;
      }
      setReminder(data as Reminder);
      setTitle(data.title);
      setCategory(data.category);
      setDeadline(data.deadline);
      setLoading(false);
    };
    fetch();
  }, [id, navigate]);

  const save = async (fields: Partial<Reminder>) => {
    if (!id) return;
    const { error } = await supabase.from("reminders").update(fields).eq("id", id);
    if (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } else {
      toast.success("Saved");
      setDirty(false);
    }
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (title !== reminder?.title) {
      save({ title });
      setReminder((r) => (r ? { ...r, title } : r));
    }
  };

  const handleCategorySelect = (c: string) => {
    setCategory(c);
    setEditingCategory(false);
    if (c !== reminder?.category) {
      save({ category: c });
      setReminder((r) => (r ? { ...r, category: c } : r));
    }
  };

  const handleDeadlineSelect = (d: string) => {
    setDeadline(d);
    setEditingDeadline(false);
    if (d !== reminder?.deadline) {
      save({ deadline: d });
      setReminder((r) => (r ? { ...r, deadline: d } : r));
    }
  };

  const handleMarkDone = async () => {
    if (!id) return;
    const { error } = await supabase.from("reminders").update({ status: "done" }).eq("id", id);
    if (error) {
      toast.error("Failed to mark as done");
    } else {
      toast.success("Marked as done");
      navigate("/");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Deleted");
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!reminder) return null;

  const createdDate = new Date(reminder.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background px-page-x py-page-y max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-btn hover:bg-muted transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-page-title tracking-tight">Reminder</h1>
      </header>

      {/* Screenshot */}
      <div className="w-full rounded-card overflow-hidden bg-muted mb-6 border border-border">
        <img
          src={reminder.image_url}
          alt={reminder.title}
          className="w-full max-h-[420px] object-contain"
        />
      </div>

      {/* Title — inline editable */}
      <div className="mb-4">
        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
            className="w-full text-page-title tracking-tight bg-transparent border-b-2 border-primary outline-none pb-1"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex items-center gap-2 group text-left"
          >
            <h2 className="text-page-title tracking-tight">{title}</h2>
            <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Category — click to change */}
      <div className="mb-4">
        {editingCategory ? (
          <div className="flex flex-wrap gap-2">
            {EDITABLE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => handleCategorySelect(c)}
                className={`px-3 py-1 rounded-pill text-pill uppercase transition-colors ${
                  c === category
                    ? getCategoryClasses(c)
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setEditingCategory(true)}
            className="group flex items-center gap-2"
          >
            <span
              className={`inline-block px-3 py-1 rounded-pill text-pill uppercase ${getCategoryClasses(category)}`}
            >
              {category}
            </span>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Deadline — click to change */}
      <div className="mb-6">
        {editingDeadline ? (
          <div>
            <div className="flex flex-wrap gap-2">
              {DEADLINE_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDeadlineSelect(d)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-label transition-colors ${
                    d === deadline
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {d}
                </button>
              ))}
              <button
                onClick={() => {
                  if (!isCustomDate(deadline)) {
                    const today = new Date().toISOString().split("T")[0];
                    setDeadline(today);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-label transition-colors ${
                  isCustomDate(deadline)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Custom
              </button>
            </div>
            {isCustomDate(deadline) && (
              <input
                type="date"
                value={deadline}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleDeadlineSelect(e.target.value)}
                className="mt-2 px-3 py-2 rounded-btn border border-border bg-card text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            )}
          </div>
        ) : (
          <button
            onClick={() => setEditingDeadline(true)}
            className="group flex items-center gap-2 text-label text-muted-foreground"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isCustomDate(deadline) ? new Date(deadline + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : deadline}</span>
            <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>

      {/* Created date */}
      <p className="text-label text-muted-foreground mb-8">Created {createdDate}</p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {reminder.status === "next" && (
          <button
            onClick={handleMarkDone}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-btn text-[15px] font-medium hover:opacity-90 transition-opacity"
          >
            <Check className="w-4 h-4" />
            Mark as Done
          </button>
        )}
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-btn text-[15px] font-medium border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Reminder
        </button>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        imageUrl={reminder.image_url}
      />
    </div>
  );
}
