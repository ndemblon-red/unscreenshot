import { Clock, Check, Trash2, AlertCircle } from "lucide-react";
import { getCategoryClasses } from "@/lib/categories";
import { dateToDeadlineLabel, getDeadlineUrgency } from "@/lib/deadlines";

export interface TaskCardProps {
  id: string;
  title: string;
  category: string;
  deadline: string;
  imageUrl: string;
  status: "next" | "done" | "archive";
  onMarkDone?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function TaskCard({
  id,
  title,
  category,
  deadline,
  imageUrl,
  status,
  onMarkDone,
  onDelete,
  onClick,
}: TaskCardProps) {
  const urgency = status === "next" ? getDeadlineUrgency(deadline) : null;

  return (
    <div
      className={`flex items-center gap-card-pad bg-card rounded-card border p-card-pad cursor-pointer hover:shadow-sm transition-shadow ${
        urgency === "today"
          ? "border-destructive/50 bg-destructive/5"
          : urgency === "tomorrow"
          ? "border-orange-400/50 bg-orange-50/50 dark:bg-orange-950/10"
          : "border-border"
      }`}
      onClick={() => onClick?.(id)}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-btn overflow-hidden flex-shrink-0 bg-muted">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-card-title truncate">{title}</h3>
          {urgency === "today" && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wide bg-destructive text-destructive-foreground whitespace-nowrap">
              <AlertCircle className="w-3 h-3" />
              Due today
            </span>
          )}
          {urgency === "tomorrow" && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wide bg-orange-500 text-white whitespace-nowrap">
              Due tomorrow
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block px-2 py-0.5 rounded-pill text-pill uppercase ${getCategoryClasses(category)}`}
          >
            {category}
          </span>
          <span className="flex items-center gap-1 text-label text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {dateToDeadlineLabel(deadline)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {status === "next" && onMarkDone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkDone(id);
            }}
            className="p-2 rounded-btn hover:bg-muted transition-colors"
            aria-label="Mark as done"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(id);
          }}
          className="p-2 rounded-btn hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
