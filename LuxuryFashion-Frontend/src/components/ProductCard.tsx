import { Link } from "react-router-dom";
import { Star, Plus, ShoppingBag } from "lucide-react";
import { FoodItem } from "@/data/foodData";
import { useCartContext } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  item: FoodItem;
  featured?: boolean;
}

export function ProductCard({ item, featured = false }: ProductCardProps) {
  const { addToCart } = useCartContext();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Convert FoodItem.id to productId
      const productId = parseInt(item.id);
      if (isNaN(productId)) {
        toast.error("Invalid product ID");
        return;
      }
      await addToCart(productId, 1);
      toast.success(`${item.name} added to cart!`, {
        icon: <ShoppingBag className="w-4 h-4" />,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to add item to cart");
    }
  };

  return (
    <Link to={`/product/${item.id}`} className="block">
      <article
        className={`card-food group ${featured ? "md:flex" : ""}`}
      >
        {/* Image */}
        <div
          className={`relative overflow-hidden ${
            featured ? "md:w-2/5" : "aspect-[4/3]"
          }`}
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Veg/Non-Veg Badge */}
          <div className="absolute top-3 left-3">
            <div
              className={`${
                item.isVeg ? "veg-badge" : "non-veg-badge"
              } bg-card`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? "bg-green-600" : "bg-red-600"
                }`}
              />
            </div>
          </div>
          {/* Special/Trending Badge */}
          {(item.isSpecial || item.isTrending) && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                {item.isSpecial ? "Special" : "Trending"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-4 md:p-5 ${featured ? "md:w-3/5 md:p-6" : ""}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-3 md:mt-4">
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-gold text-gold" />
            <span className="text-xs md:text-sm font-medium text-foreground">
              {item.rating}
            </span>
            <span className="text-xs md:text-sm text-muted-foreground">
              • {item.category}
            </span>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between mt-4 md:mt-5 gap-3">
            <span className="text-lg md:text-xl font-bold text-foreground">
              ₹{item.price}
            </span>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs md:text-sm font-medium hover:bg-primary/90 transition-all duration-300 hover:shadow-md"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
