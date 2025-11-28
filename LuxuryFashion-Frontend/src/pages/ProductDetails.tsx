import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Plus, Minus, ShoppingBag, Clock, Flame } from "lucide-react";
import { useState } from "react";
import { foodItems } from "@/data/foodData";
import { useCartContext } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, cartItems, updateQuantity } = useCartContext();
  const [quantity, setQuantity] = useState(1);

  const item = foodItems.find((f) => f.id === id);
  const cartItem = cartItems.find((c) => c.id === id);
  const relatedItems = foodItems
    .filter((f) => f.category === item?.category && f.id !== id)
    .slice(0, 4);

  if (!item) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🍽️</p>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Product not found
        </h1>
        <Link to="/menu" className="btn-primary">
          Back to Menu
        </Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    toast.success(`${quantity}x ${item.name} added to cart!`, {
      icon: <ShoppingBag className="w-4 h-4" />,
    });
    setQuantity(1);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/menu"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Menu
      </Link>

      {/* Product Details */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden bg-card">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div
              className={`${
                item.isVeg ? "veg-badge" : "non-veg-badge"
              } bg-card scale-125`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  item.isVeg ? "bg-green-600" : "bg-red-600"
                }`}
              />
            </div>
          </div>
          {(item.isSpecial || item.isTrending) && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-accent text-accent-foreground">
                {item.isSpecial ? "Chef's Special" : "Trending"}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-primary font-medium mb-2">
              {item.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {item.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-gold text-gold" />
                <span className="font-semibold text-foreground">
                  {item.rating}
                </span>
                <span className="text-muted-foreground">(50+ ratings)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>25-30 min</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame className="w-4 h-4" />
                <span>Popular</span>
              </div>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          {/* Ingredients */}
          {item.ingredients && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              ₹{item.price}
            </span>
            <span className="text-muted-foreground">per serving</span>
          </div>

          {/* Add to Cart */}
          <div className="flex items-center gap-4 pt-4">
            {/* Quantity */}
            <div className="flex items-center gap-3 p-2 bg-secondary rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-lg hover:bg-card transition-colors duration-300"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-8 text-center font-semibold text-lg">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 rounded-lg hover:bg-card transition-colors duration-300"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Cart - ₹{item.price * quantity}
            </button>
          </div>

          {/* Already in cart */}
          {cartItem && (
            <p className="text-sm text-muted-foreground">
              ✓ {cartItem.quantity} item(s) already in cart
            </p>
          )}
        </div>
      </div>

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetails;
