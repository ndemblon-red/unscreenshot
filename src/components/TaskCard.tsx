import { Clock, Check, Trash2 } from "lucide-react";
import { getCategoryClasses } from "@/lib/categories";
import { dateToDeadlineLabel } from "@/lib/deadlines";

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
  return (
    <div
      className="flex items-center gap-card-pad bg-card rounded-card border border-border p-card-pad cursor-pointer hover:shadow-sm transition-shadow"
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
        <h3 className="text-card-title truncate">{title}</h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block px-2 py-0.5 rounded-pill text-pill uppercase ${getCategoryClasses(category)}`}
          >
            {category}
          </span>
          <span className="flex items-center gap-1 text-label text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {deadline}
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
