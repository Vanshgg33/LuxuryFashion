import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "Recommended", icon: "🔥" },
  { id: "Thalis", label: "Thalis", icon: "🍱" },
  { id: "North Indian", label: "North Indian", icon: "🍛" },
  { id: "Chinese", label: "Chinese", icon: "🥡" },
  { id: "Desserts", label: "Desserts", icon: "🍰" },
  { id: "Beverages", label: "Beverages", icon: "🥤" },
];

export function StickyMenuTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSticky, setIsSticky] = useState(false);
  const selectedCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categoryId);
    }
    setSearchParams(searchParams);
    
    // Scroll to menu section
    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className={cn(
        "bg-card border-b border-border transition-all duration-300 z-40",
        isSticky ? "sticky top-0 shadow-md" : "relative"
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300",
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

