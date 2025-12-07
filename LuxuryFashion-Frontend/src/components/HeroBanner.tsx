import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { specialOffers } from "@/data/foodData";

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % specialOffers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % specialOffers.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + specialOffers.length) % specialOffers.length
    );
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-warm" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <div className="space-y-5 md:space-y-6 animate-fade-in">
            <span className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-sage-light text-primary font-semibold rounded-full text-xs md:text-sm">
              🍽️ Premium Food Delivery
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-foreground leading-tight">
              Delicious Food,{" "}
              <span className="text-gradient">Delivered Fresh</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg">
              Experience the finest culinary delights from top restaurants,
              prepared with love and delivered to your doorstep within minutes.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link to="/menu" className="btn-primary inline-flex items-center gap-2 text-sm md:text-base px-5 md:px-6 py-2.5 md:py-3">
                Explore Menu
                <ArrowRight className="w-4 h-5 md:w-5" />
              </Link>
              <Link to="/menu?category=Veg" className="btn-outline inline-flex items-center gap-2 text-sm md:text-base px-5 md:px-6 py-2.5 md:py-3">
                🥬 Veg Specials
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-6 md:gap-8 pt-4 md:pt-6">
              {[
                { value: "30min", label: "Fast Delivery" },
                { value: "500+", label: "Menu Items" },
                { value: "4.8", label: "Avg Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Offers Carousel */}
          <div className="relative">
            <div className="relative bg-card rounded-3xl p-8 shadow-card overflow-hidden">
              {specialOffers.map((offer, index) => (
                <div
                  key={offer.id}
                  className={`transition-all duration-500 ${
                    index === currentSlide
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 absolute inset-0 translate-x-full"
                  }`}
                >
                  <div
                    className={`bg-gradient-to-br ${offer.bgColor} rounded-2xl p-8 text-center`}
                  >
                    <span className="text-5xl mb-4 block">🎉</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                      {offer.title}
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      {offer.description}
                    </p>
                    <Link
                      to="/menu"
                      className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              ))}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {specialOffers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "w-8 bg-primary"
                          : "bg-border hover:bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-pulse-soft" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-float" />
          </div>
        </div>
      </div>
    </section>
  );
}
