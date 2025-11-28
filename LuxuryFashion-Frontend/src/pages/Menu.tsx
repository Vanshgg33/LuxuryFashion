import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { foodItems } from "@/data/foodData";

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const filteredItems = useMemo(() => {
    let items = [...foodItems];

    // Filter by category
    if (selectedCategory !== "all") {
      items = items.filter(
        (item) =>
          item.category === selectedCategory ||
          (selectedCategory === "Veg" && item.isVeg) ||
          (selectedCategory === "Non-Veg" && !item.isVeg)
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        items.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return items;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          Our Menu
        </h1>
        <p className="text-muted-foreground">
          Discover our delicious collection of {foodItems.length}+ dishes
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300"
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8 overflow-x-auto pb-2">
        <CategoryFilter
          selected={selectedCategory}
          onChange={handleCategoryChange}
        />
      </div>

      {/* Results Count */}
      <p className="text-muted-foreground mb-6">
        Showing {filteredItems.length} items
        {selectedCategory !== "all" && ` in ${selectedCategory}`}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Products Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🍽️</p>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No dishes found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </main>
  );
};

export default Menu;
