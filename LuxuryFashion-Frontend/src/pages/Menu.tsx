import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, Leaf } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/data/foodData";
import type { FoodItem } from "@/data/foodData";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   RANGEELA DHABA — MENU PAGE
   Elegant, food-first menu for easy browsing and ordering
═══════════════════════════════════════════════════════════════════════════ */

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [vegOnly, setVegOnly] = useState(false);
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prods = await fetchProducts();
        setAllItems(prods);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();

    // Refresh products every 60 seconds to catch stock changes
    const interval = setInterval(() => {
      fetchProducts().then(setAllItems).catch(console.error);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update search query when URL param changes
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  // Get categories with counts
  const categories = useMemo(() => {
    const catMap: Record<string, number> = {};
    allItems.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [allItems]);

  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Filter by category
    if (selectedCategory !== "all") {
      items = items.filter((item) => item.category === selectedCategory);
    }

    // Filter by veg
    if (vegOnly) {
      items = items.filter((item) => item.isVeg);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [selectedCategory, searchQuery, vegOnly, allItems]);

  // Group items by category for display
  const groupedByCategory = useMemo(() => {
    if (selectedCategory !== "all") return null;

    const groups: Record<string, FoodItem[]> = {};
    filteredItems.forEach((item) => {
      const cat = item.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems, selectedCategory]);

  const clearSearch = () => {
    setSearchQuery("");
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Elegant Header */}
      <section className="bg-secondary/30 border-b border-border/50">
        <div className="container-custom py-10 md:py-14">
          <span className="label-premium mb-3 block">
            Explore Our Dishes
          </span>
          <h1 className="section-title mb-2">
            Our Menu
          </h1>
          <p className="section-subtitle">
            Authentic Bengali cuisine — fresh, flavorful, made with love
          </p>
        </div>
      </section>

      {/* Sticky Search & Filters */}
      <div className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="container-custom py-4">
          {/* Search & Veg Toggle */}
          <div className="flex items-center gap-3 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-10 py-2.5",
                  "bg-secondary border border-border/50 rounded-xl",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                  "transition-all duration-200"
                )}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Veg Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200",
                vegOnly
                  ? "bg-bengali-green text-white border-bengali-green"
                  : "bg-white text-foreground border-border/50 hover:border-bengali-green/50"
              )}
            >
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Veg Only</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => handleCategoryChange("all")}
              className={cn(
                "category-pill",
                selectedCategory === "all" && "active"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "category-pill",
                  selectedCategory === category && "active"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="container-wide pt-6">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"}
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
          {vegOnly && " (Veg only)"}
        </p>
      </div>

      {/* Menu Content */}
      <div className="container-wide py-6 pb-24">
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-border/50">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          // Show items - grouped if "all", flat list otherwise
          groupedByCategory ? (
            <div className="space-y-10">
              {Object.entries(groupedByCategory).map(([category, items]) => (
                <section key={category}>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      {category}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({items.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <ProductCard item={item} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard item={item} />
                </div>
              ))}
            </div>
          )
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No dishes found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setVegOnly(false);
                setSelectedCategory("all");
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Menu;
