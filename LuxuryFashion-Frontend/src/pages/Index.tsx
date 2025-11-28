import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Sparkles, Star } from "lucide-react";
import { HeroBanner } from "@/components/HeroBanner";
import { ProductCard } from "@/components/ProductCard";
import { foodItems, categories } from "@/data/foodData";

const Index = () => {
  const trendingItems = foodItems.filter((item) => item.isTrending).slice(0, 4);
  const specialItems = foodItems.filter((item) => item.isSpecial).slice(0, 4);
  const topRatedItems = [...foodItems]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <main>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Browse Categories</h2>
          <Link
            to="/menu"
            className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.slice(1).map((category, index) => (
            <Link
              key={category.id}
              to={`/menu?category=${category.id}`}
              className="group p-6 bg-card rounded-2xl border border-border hover:border-primary hover:shadow-card transition-all duration-300 text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </span>
              <span className="font-medium text-foreground">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4 py-16 bg-sage-light/50 -mx-4 px-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h2 className="section-title">Trending Now</h2>
          </div>
          <Link
            to="/menu"
            className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingItems.map((item, index) => (
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

      {/* Today's Specials */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h2 className="section-title">Today's Specials</h2>
          </div>
          <Link
            to="/menu"
            className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard item={item} featured />
            </div>
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section className="container mx-auto px-4 py-16 bg-terracotta-light/50 -mx-4 px-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold/10">
              <Star className="w-6 h-6 text-gold fill-gold" />
            </div>
            <h2 className="section-title">Top Rated</h2>
          </div>
          <Link
            to="/menu"
            className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topRatedItems.map((item, index) => (
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

      {/* CTA Banner */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary to-olive rounded-3xl p-8 md:p-12">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Hungry? Order Now!
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-6">
              Get 20% off on your first order. Use code{" "}
              <span className="font-bold">FIRST20</span> at checkout.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-card text-foreground rounded-xl font-semibold hover:bg-card/90 transition-all duration-300 hover:shadow-lg"
            >
              Order Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-foreground/5 rounded-full" />
        </div>
      </section>
    </main>
  );
};

export default Index;
