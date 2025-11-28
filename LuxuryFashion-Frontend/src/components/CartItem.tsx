import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/hooks/useCart";
import { useCartContext } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartContext();

  return (
    <article className="flex gap-4 p-4 bg-card rounded-2xl border border-border">
      {/* Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  item.isVeg ? "veg-badge" : "non-veg-badge"
                } scale-75`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.isVeg ? "bg-green-600" : "bg-red-600"
                  }`}
                />
              </div>
              <h3 className="font-semibold text-foreground truncate">
                {item.name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ₹{item.price} each
            </p>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quantity & Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-lg font-bold text-foreground">
            ₹{item.price * item.quantity}
          </span>
        </div>
      </div>
    </article>
  );
}
