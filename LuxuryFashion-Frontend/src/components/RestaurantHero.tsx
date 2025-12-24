import { Heart, Share2, MapPin, Clock, IndianRupee, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function RestaurantHero() {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = () => {
    if (!user) {
      
      return;
    }
    // For single restaurant, just toggle local state
    setIsFavorite(!isFavorite);
    
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rangeela Dhaba",
          text: "Check out Rangeela Dhaba - Authentic Veg Food!",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      
    }
  };

  return (
    <section className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left - Restaurant Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Rangeela Dhaba
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-gold text-gold" />
                  <span className="font-semibold text-foreground">4.8</span>
                  <span className="text-sm text-muted-foreground">(10k+ ratings)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>🥗 Pure Veg</span>
                  <span>•</span>
                  <span>🍛 North Indian</span>
                  <span>•</span>
                  <span>🥡 Chinese</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Sector 18, Noida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>30 mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                <span>₹200 for one</span>
              </div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-start gap-3 justify-end lg:justify-start">
            <button
              onClick={handleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                isFavorite
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border hover:border-primary text-foreground"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-primary" : ""}`} />
              <span className="font-medium">Favourite</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border bg-card hover:border-primary text-foreground transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Offer Strip */}
        <div className="mt-6 pt-6 border-t border-border">
          <Link
            to="/offers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl hover:from-primary/20 hover:to-accent/20 transition-all duration-300"
          >
            <span className="text-xl">🔥</span>
            <span className="font-semibold text-foreground">
              Flat 50% OFF up to ₹150
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="font-bold text-primary">Use WELCOME50</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

