import { Star, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { FoodItem } from "@/data/foodData";
import { useCartContext } from "@/contexts/CartContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PortionSelector } from "@/components/PortionSelector";

/* ═══════════════════════════════════════════════════════════════════════════
   KOLKATA KITCHEN — PRODUCT CARD
   Simple, food-first card with clear add-to-cart action
═══════════════════════════════════════════════════════════════════════════ */

interface ProductCardProps {
  item: FoodItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState<{ isHalf: boolean; price: number }>({ 
    isHalf: false, 
    price: item.price 
  });

  // Check if item is already in cart (safely handle undefined)
  const cart = cartItems || [];
  const cartItem = cart.find((c) => {
    const cartDishId = c.dish?._id || c.dish?.id || (c as any).dishId;
    return String(cartDishId) === String(item.id);
  });
  const quantityInCart = cartItem?.quantity || 0;
  // Get the cart item ID for updates (could be the cart item id or the dish id for guest cart)
  const cartItemId = cartItem?.id || cartItem?.dish?._id || cartItem?.dish?.id || String(item.id);

  // Check if item is available (both in stock AND within time window)
  const isItemAvailable = item.inStock !== false && item.isAvailableNow !== false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isItemAvailable || !item.id) return;

    setIsAdding(true);
    try {
      const dishId = String(item.id);
      // If BOGO is enabled, add 2 quantities but charge for 1
      const quantity = item.isBuyOneGetOne ? 2 : 1;
      await addToCart(dishId, quantity, selectedPortion.isHalf);
    } catch (error: any) {
      console.error("Failed to add item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDecreaseQuantity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdating) return;

    setIsUpdating(true);
    try {
      if (quantityInCart <= 1) {
        // Remove item if quantity would go to 0
        await removeFromCart(cartItemId);
      } else {
        // Decrease quantity
        await updateQuantity(cartItemId, quantityInCart - 1);
      }
    } catch (error: any) {
      console.error("Failed to decrease quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncreaseQuantity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    setIsAdding(true);
    try {
      const dishId = String(item.id);
      await addToCart(dishId, 1, selectedPortion.isHalf);
    } catch (error: any) {
      console.error("Failed to increase quantity:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link to={`/product/${item.id}`} className="group block h-full">
      <article className="food-card h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Veg/Non-Veg Badge */}
          <div className="absolute top-3 left-3">
            <div
              className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center bg-white",
                item.isVeg ? "border-veg" : "border-non-veg"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  item.isVeg ? "bg-veg" : "bg-non-veg"
                )}
              />
            </div>
          </div>

          {/* Rating Badge (only if high rating) */}
          {item.rating >= 4.0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/95 rounded-full shadow-soft">
              <Star className="w-3 h-3 fill-mustard text-mustard" />
              <span className="text-xs font-semibold">{item.rating}</span>
            </div>
          )}

          {/* BOGO Badge */}
          {item.isBuyOneGetOne && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full shadow-lg">
                🎁 Buy 1 Get 1
              </span>
            </div>
          )}

          {/* Bestseller/Special Badge */}
          {(item.isSpecial || item.isTrending) && !item.isBuyOneGetOne && (
            <div className="absolute bottom-3 left-3">
              <span className="badge-bestseller">
                {item.isSpecial ? "Chef's Special" : "Popular"}
              </span>
            </div>
          )}

          {/* Unavailable Overlay (Out of Stock or Time Restricted) */}
          {!isItemAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="px-3 py-1.5 bg-white text-foreground text-sm font-medium rounded-full text-center">
                {item.inStock === false ? (
                  <span>Out of Stock</span>
                ) : item.isAvailableNow === false && item.availabilityReason ? (
                  <span className="text-xs">{item.availabilityReason}</span>
                ) : (
                  <span>Unavailable</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          {/* Name & Description */}
          <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-terracotta transition-colors">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">
              {item.description}
            </p>
          )}

          {/* Price & Add Button */}
          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50 gap-2">
            <div className="flex-shrink-0">
              <p className="text-base sm:text-lg font-bold text-foreground">₹{selectedPortion.price}</p>
              {item.hasHalfPortion && item.halfPortionPrice && !selectedPortion.isHalf && (
                <p className="text-xs text-muted-foreground">Half: ₹{item.halfPortionPrice}</p>
              )}
              {item.originalPrice && item.originalPrice > selectedPortion.price && (
                <p className="text-[10px] sm:text-xs text-muted-foreground line-through">₹{item.originalPrice}</p>
              )}
            </div>

            {/* Portion Selector */}
            <div
              className="flex-1 max-w-[120px]"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <PortionSelector
                hasHalfPortion={item.hasHalfPortion || false}
                fullPrice={item.price}
                halfPrice={item.halfPortionPrice}
                onPortionChange={(isHalf, price) => setSelectedPortion({ isHalf, price })}
              />
            </div>

            {/* Add to Cart Button */}
            {quantityInCart > 0 ? (
              // Show quantity controls if already in cart
              <div
                className="flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-primary to-accent rounded-lg sm:rounded-xl overflow-hidden shadow-md"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleDecreaseQuantity}
                  disabled={isUpdating}
                  className="p-1.5 sm:p-2.5 text-foreground hover:bg-black/10 transition-colors disabled:opacity-50"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <span className="text-foreground font-bold min-w-[1.5rem] sm:min-w-[2rem] text-center text-xs sm:text-sm">
                  {isUpdating ? "..." : quantityInCart}
                </span>
                <button
                  onClick={handleIncreaseQuantity}
                  disabled={isAdding}
                  className="p-1.5 sm:p-2.5 text-foreground hover:bg-black/10 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              // Show Add button if not in cart
              <button
                onClick={handleAddToCart}
                disabled={!isItemAvailable || isAdding}
                className={cn(
                  "inline-flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5",
                  "bg-gradient-to-r from-primary to-accent text-foreground",
                  "font-bold text-xs sm:text-sm",
                  "rounded-lg sm:rounded-xl shadow-md",
                  "transition-all duration-200",
                  "hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98]",
                  (!isItemAvailable || isAdding) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                {isAdding ? "..." : "ADD"}
              </button>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
