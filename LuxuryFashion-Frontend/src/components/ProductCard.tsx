import { Star, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FoodItem } from "@/data/foodData";
import { useCartContext } from "@/contexts/CartContext";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   RANGEELA DHABA — PRODUCT CARD
   3D animated card with micro-interactions
═══════════════════════════════════════════════════════════════════════════ */

interface ProductCardProps {
  item: FoodItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // 3D tilt effect handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    setRotateX(mouseY / 20);
    setRotateY(-mouseX / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Check if item is already in cart (safely handle undefined)
  const cart = cartItems || [];
  const cartItem = cart.find((c) => {
    const cartDishId = c.dish?._id || c.dish?.id || (c as any).dishId;
    return String(cartDishId) === String(item.id);
  });
  const quantityInCart = cartItem?.quantity || 0;
  // Get the cart item ID for updates (could be the cart item id or the dish id for guest cart)
  const cartItemId = cartItem?.id || cartItem?.dish?._id || cartItem?.dish?.id || String(item.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (item.inStock === false || !item.id) return;

    setIsAdding(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 800);

    try {
      const dishId = String(item.id);
      await addToCart(dishId, 1);
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
      await addToCart(dishId, 1);
    } catch (error: any) {
      console.error("Failed to increase quantity:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link to={`/product/${item.id}`} className="group block h-full perspective-1000">
      <motion.article
        ref={cardRef}
        className="food-card h-full flex flex-col relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ["#f59e0b", "#22c55e", "#ef4444", "#3b82f6"][i % 4],
                    left: "50%",
                    top: "50%",
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 150,
                    y: (Math.random() - 0.5) * 150,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.02 }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <motion.img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
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

          {/* Bestseller/Special Badge */}
          {(item.isSpecial || item.isTrending) && (
            <div className="absolute bottom-3 left-3">
              <span className="badge-bestseller">
                {item.isSpecial ? "Chef's Special" : "Popular"}
              </span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {item.inStock === false && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-3 py-1.5 bg-white text-foreground text-sm font-medium rounded-full">
                Unavailable
              </span>
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
              <p className="text-base sm:text-lg font-bold text-foreground">₹{item.price}</p>
              {item.originalPrice && item.originalPrice > item.price && (
                <p className="text-[10px] sm:text-xs text-muted-foreground line-through">₹{item.originalPrice}</p>
              )}
            </div>

            {/* Add to Cart Button */}
            {quantityInCart > 0 ? (
              // Show quantity controls if already in cart
              <div
                className="flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-primary to-accent rounded-lg sm:rounded-xl overflow-hidden shadow-md"
                onClick={(e) => e.preventDefault()}
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
                disabled={item.inStock === false || isAdding}
                className={cn(
                  "inline-flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5",
                  "bg-gradient-to-r from-primary to-accent text-foreground",
                  "font-bold text-xs sm:text-sm",
                  "rounded-lg sm:rounded-xl shadow-md",
                  "transition-all duration-200",
                  "hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98]",
                  (item.inStock === false || isAdding) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                {isAdding ? "..." : "ADD"}
              </button>
            )}
          </div>
        </div>

        {/* Glare effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${50 + rotateY * 3}% ${50 + rotateX * 3}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
          }}
        />
      </motion.article>
    </Link>
  );
}
