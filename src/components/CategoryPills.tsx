import { CATEGORIES } from "@/lib/categories";
import { getCategoryClasses } from "@/lib/categories";

interface CategoryPillsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        const isEverything = cat === "Everything";

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-pill text-pill uppercase transition-colors
              ${
                isActive
                  ? isEverything
                    ? "bg-primary text-primary-foreground"
                    : getCategoryClasses(cat)
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
