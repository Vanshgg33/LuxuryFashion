import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/data/foodData";
import type { FoodItem } from "@/data/foodData";

const Offers = () => {
  const [products, setProducts] = useState<FoodItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const prods = await fetchProducts();
        setProducts(prods);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    })();
  }, []);

  const specialItems = products.filter((item) => item.isSpecial || item.isTrending);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-primary font-semibold">Special Offers</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          Exclusive Offers & Deals
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Don't miss out on these amazing deals! Limited time offers on your favorite dishes.
        </p>
      </div>

      {/* Main Offer Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-olive to-primary rounded-3xl p-8 md:p-12 shadow-xl mb-12">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-6 h-6 text-primary-foreground" />
            <span className="text-primary-foreground font-semibold text-lg">First Order Special</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3">
            Flat 50% OFF up to ₹150
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-2">
            Use code: <span className="font-bold text-xl">WELCOME50</span>
          </p>
          <p className="text-primary-foreground/80 text-sm mb-6">
            Valid today • Min order ₹199
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 bg-card text-foreground rounded-xl font-semibold hover:bg-card/90 transition-all duration-300 hover:shadow-lg text-lg"
          >
            Claim Offer
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-foreground/5 rounded-full" />
      </div>

      {/* Special Items */}
      {specialItems.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Special Dishes
            </h2>
            <Link
              to="/menu"
              className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
            >
              View All Menu
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-16">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No special offers at the moment
          </h3>
          <p className="text-muted-foreground mb-6">
            Check back soon for amazing deals!
          </p>
          <Link
            to="/menu"
            className="btn-primary inline-flex items-center gap-2"
          >
            Browse Menu
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </main>
  );
};

export default Offers;


