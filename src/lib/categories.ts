export const CATEGORIES = [
  "Everything",
  "Restaurants",
  "Shopping",
  "To Do",
  "Events",
  "Reading",
  "Home",
  "Travel",
  "Wishlist",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Maps a category to its Tailwind `bg-tag-*` and `text-white` classes */
export function getCategoryClasses(category: string): string {
  const map: Record<string, string> = {
    Events: "bg-tag-events text-white",
    Shopping: "bg-tag-shopping text-white",
    Restaurants: "bg-tag-restaurants text-white",
    "To Do": "bg-tag-todo text-white",
    Reading: "bg-tag-reading text-white",
    Home: "bg-tag-home text-white",
    Travel: "bg-tag-travel text-white",
    Wishlist: "bg-tag-wishlist text-white",
  };
  return map[category] ?? "bg-muted text-foreground";
}
