import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { BackendCartItem } from "@/hooks/useCartBackend";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CartItemProps {
  item: BackendCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartContext();
  const [isUpdating, setIsUpdating] = useState(false);

  const productImage = item.dish?.imageUrl || "/placeholder.svg";
  const productName = item.dish?.name || "Dish";
  const productPrice = item.dish?.price || item.price;
  const isVeg = item.dish?.isVeg;

  const handleQuantityChange = async (newQuantity: number) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article className="group card-premium p-4 md:p-5 hover:shadow-medium transition-all duration-300">
      <div className="flex gap-4 md:gap-5">
        {/* Image */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-soft">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {/* Veg/Non-veg indicator */}
          {isVeg !== undefined && (
            <div className={cn(
              "absolute -top-1 -left-1 w-5 h-5 rounded flex items-center justify-center bg-white shadow-soft border-2",
              isVeg ? "border-green-500" : "border-red-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isVeg ? "bg-green-500" : "bg-red-500"
              )} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-terracotta transition-colors duration-300">
                {productName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  ₹{productPrice}
                </span>
                {item.dish?.category && (
                  <>
                    <span className="text-border">•</span>
                    <span className="text-xs text-muted-foreground">
                      {item.dish.category}
                    </span>
                  </>
                )}
              </div>
            </div>
            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(item.id)}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                "text-muted-foreground hover:text-destructive",
                "hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
              )}
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between mt-4">
            {/* Quantity Stepper */}
            <div className={cn(
              "inline-flex items-center rounded-xl",
              "bg-secondary border border-border/50",
              isUpdating && "opacity-50 pointer-events-none"
            )}>
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className={cn(
                  "p-2.5 rounded-l-xl transition-all duration-300",
                  "hover:bg-terracotta hover:text-white",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current"
                )}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold tabular-nums">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
                className={cn(
                  "p-2.5 rounded-r-xl transition-all duration-300",
                  "hover:bg-terracotta hover:text-white",
                  "disabled:opacity-30 disabled:cursor-not-allowed"
                )}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Total Price */}
            <p className="text-lg font-bold text-foreground tabular-nums">
              ₹{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
