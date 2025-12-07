import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { BackendCartItem } from "@/hooks/useCartBackend";

interface CartItemProps {
  item: BackendCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartContext();

  const productImage = item.product?.imagenames?.[0] || "/placeholder.svg";
  const productName = item.product?.prod_name || "Unknown Product";
  const productPrice = item.product?.selling_price || item.product?.prod_price || item.price;

  return (
    <article className="flex gap-3 md:gap-4 p-4 md:p-5 bg-card rounded-2xl border border-border">
      {/* Image */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
              {productName}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              ₹{productPrice} each
              {item.size && <span className="ml-2">• Size: {item.size}</span>}
            </p>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-1.5 md:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors duration-300 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quantity & Price */}
        <div className="flex items-center justify-between mt-3 md:mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-1.5 md:p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <span className="w-7 md:w-8 text-center text-sm md:text-base font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1.5 md:p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
          <span className="text-base md:text-lg font-bold text-foreground">
            ₹{(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
}
