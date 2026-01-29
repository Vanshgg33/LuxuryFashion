import { Minus, Plus, Trash2, Gift } from "lucide-react";
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
  const isBogo = item.dish?.isBuyOneGetOne;
  const isFreeItem = item.isFreeItem || false;

  // Calculate paid and free quantities for BOGO
  const paidQuantity = isBogo ? Math.ceil(item.quantity / 2) : item.quantity;
  const freeQuantity = isBogo ? Math.floor(item.quantity / 2) : 0;

  // Calculate item total with BOGO discount
  const itemTotal = item.itemTotal !== undefined
    ? item.itemTotal
    : (isBogo && item.quantity > 0
        ? productPrice * paidQuantity
        : productPrice * item.quantity);

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
    <article className={cn(
      "group card-premium p-4 md:p-5 hover:shadow-medium transition-all duration-300",
      isFreeItem && "bg-green-50 border-green-200"
    )}>
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
              <h3 className={cn(
                "font-semibold line-clamp-1 group-hover:text-terracotta transition-colors duration-300",
                isFreeItem ? "text-green-700" : "text-foreground"
              )}>
                {productName}
                {isFreeItem && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">
                    <Gift className="w-3 h-3" />
                    FREE
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-sm",
                  isFreeItem ? "text-green-600 line-through" : "text-muted-foreground"
                )}>
                  ₹{productPrice}
                </span>
                {isFreeItem && (
                  <span className="text-sm font-bold text-green-600">₹0</span>
                )}
                {item.couponCode && (
                  <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                    {item.couponCode}
                  </span>
                )}
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
            {/* Remove Button - Hide for free items */}
            {!isFreeItem && (
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
            )}
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between mt-4">
            {/* Quantity Stepper - Hide for free items */}
            {!isFreeItem ? (
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
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-xl">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Qty: {item.quantity}
                </span>
              </div>
            )}

            {/* Total Price */}
            <div className="text-right">
              <p className={cn(
                "text-lg font-bold tabular-nums",
                isFreeItem ? "text-green-600" : "text-foreground"
              )}>
                {isFreeItem ? "FREE" : `₹${itemTotal.toFixed(2)}`}
              </p>
            </div>
          </div>

          {/* BOGO Breakdown - Show paid and free items separately */}
          {isBogo && item.quantity >= 1 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  Buy 1 Get 1 Free
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                {/* Paid items */}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {paidQuantity}x {productName}
                  </span>
                  <span className="font-medium">₹{(productPrice * paidQuantity).toFixed(2)}</span>
                </div>
                {/* Free items */}
                {freeQuantity > 0 && (
                  <div className="flex justify-between items-center bg-green-50 -mx-2 px-2 py-1.5 rounded-lg">
                    <span className="text-green-700 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" />
                      {freeQuantity}x {productName}
                      <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded font-semibold">
                        FREE
                      </span>
                    </span>
                    <span className="font-medium text-green-600">₹0.00</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
