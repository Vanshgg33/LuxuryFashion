import { Star, Plus, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { FoodItem } from "@/data/foodData";
import { useCartContext } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { addFavorite, removeFavorite, checkFavorite } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface DishCardZomatoProps {
  item: FoodItem;
  isBestseller?: boolean;
}

export function DishCardZomato({ item, isBestseller = false }: DishCardZomatoProps) {
  const { addToCart } = useCartContext();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user && item.id) {
      checkFavorite(item.id)
        .then((fav) => setIsFavorite(fav))
        .catch(() => setIsFavorite(false));
    }
  }, [user, item.id]);

  // Check if item is available (both in stock AND within time window)
  const isItemAvailable = item.inStock !== false && item.isAvailableNow !== false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isItemAvailable) return;

    setIsAdding(true);
    try {
      await addToCart(item.id, 1);
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(item.id);
        setIsFavorite(false);
      } else {
        await addFavorite(item.id);
        setIsFavorite(true);
      }
    } catch (err: any) {
      console.error("Failed to update favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/product/${item.id}`} className="block group">
      <div className="flex gap-4 md:gap-6 p-4 md:p-6 hover:bg-secondary/30 transition-all duration-300">
        {/* Content - Left (Main) */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Header */}
          <div className="space-y-2">
            {/* Badges Row */}
            <div className="flex items-center gap-2">
              {/* Veg/Non-Veg Badge */}
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center bg-white border-2",
                item.isVeg ? "border-green-500" : "border-red-500"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  item.isVeg ? "bg-green-500" : "bg-red-500"
                )} />
              </div>

              {/* Bestseller Badge */}
              {isBestseller && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 text-xs font-semibold rounded-full">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Bestseller
                </span>
              )}

              {/* Out of Stock / Time Restricted Badge */}
              {item.inStock === false ? (
                <span className="inline-flex items-center px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-full">
                  Out of stock
                </span>
              ) : item.isAvailableNow === false && item.availabilityReason ? (
                <span className="inline-flex items-center px-2 py-0.5 bg-orange-500/10 text-orange-600 text-xs font-semibold rounded-full">
                  {item.availabilityReason}
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-base md:text-lg text-foreground group-hover:text-accent transition-colors duration-300 line-clamp-1">
              {item.name}
            </h3>

            {/* Price */}
            <p className="text-lg font-bold text-foreground">
              ₹{item.price}
            </p>

            {/* Rating & Category */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{item.rating}</span>
              </div>
              {item.category && (
                <>
                  <span className="text-border">•</span>
                  <span className="text-muted-foreground">{item.category}</span>
                </>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* Actions - Bottom */}
          <div className="flex items-center gap-3 mt-4">
            {/* Favorite Button */}
            {user && (
              <button
                onClick={handleFavorite}
                disabled={loading}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300",
                  isFavorite
                    ? "text-red-500 bg-red-500/10"
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>
            )}
          </div>
        </div>

        {/* Image - Right */}
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-soft">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Add Button - Overlapping */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            <button
              onClick={handleAddToCart}
              disabled={!isItemAvailable || isAdding}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                "shadow-medium",
                !isItemAvailable
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-white text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white"
              )}
            >
              <Plus className="w-4 h-4" />
              {isAdding ? "..." : "ADD"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
