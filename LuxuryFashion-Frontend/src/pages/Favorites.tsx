import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "@/lib/api";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartContext } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartContext();

  useEffect(() => {
    loadFavorites();

    // Refresh when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFavorites();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(Array.isArray(data) ? data.map((f: any) => f.dish || f) : []);
    } catch (err: any) {
      console.error("Failed to load favorites", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (dishId: string) => {
    try {
      await removeFavorite(dishId);
      setFavorites((prev) => prev.filter((f) => (f._id || f.id) !== dishId));
      toast.success("Removed from favorites");
    } catch (err: any) {
      console.error("Failed to remove favorite:", err);
      toast.error(err.message || "Failed to remove from favorites");
    }
  };

  const handleAddToCart = async (dish: any) => {
    try {
      await addToCart(dish._id || dish.id, 1);
      toast.success("Added to cart");
    } catch (err: any) {
      console.error("Failed to add to cart:", err);
      toast.error(err.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Favorites</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No favorites yet</p>
          <Link to="/menu" className="btn-primary">Browse Menu</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((dish) => (
            <div key={dish._id || dish.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <Link to={`/product/${dish._id || dish.id}`}>
                <img
                  src={dish.imageUrl || "/placeholder.svg"}
                  alt={dish.name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${dish._id || dish.id}`}>
                  <h3 className="font-semibold text-foreground mb-2">{dish.name}</h3>
                </Link>
                <p className="text-primary font-bold mb-4">₹{dish.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(dish._id || dish.id)}
                    className="btn-secondary p-2"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}






