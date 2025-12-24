import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function StickyCartBar() {
  const { cartCount, cartTotal } = useCartContext();
  const { user } = useAuth();

  // Don't show if user is not logged in or cart is empty
  if (!user || cartCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none md:hidden">
      <div className="container-wide">
        <Link
          to="/cart"
          className={cn(
            "pointer-events-auto",
            "flex items-center justify-between",
            "w-full",
            "px-4 py-3",
            "bg-gradient-to-r from-primary to-accent text-foreground",
            "rounded-2xl shadow-lg",
            "transition-all duration-300",
            "hover:shadow-xl",
            "active:scale-[0.99]",
            "group"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 bg-foreground text-background text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </p>
              <p className="text-xs text-foreground/70">
                ₹{cartTotal.toFixed(0)} + taxes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl font-bold text-sm transition-all duration-300 group-hover:gap-3">
            Checkout
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}

