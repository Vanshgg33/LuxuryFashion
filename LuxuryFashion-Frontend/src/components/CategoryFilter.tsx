import { categories } from "@/data/foodData";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all duration-300",
            selected === category.id
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border hover:border-primary hover:shadow-sm"
          )}
        >
          <span className="text-lg">{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
