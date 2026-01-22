import { Link } from "react-router-dom";
import {
  ArrowRight,
  Star,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  Utensils,
  Truck,
  Leaf,
  Heart,
  ChefHat,
  ExternalLink
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { fetchProducts } from "@/data/foodData";
import { fetchGallery, getTopReviews } from "@/lib/api";
import type { FoodItem } from "@/data/foodData";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";

/* ═══════════════════════════════════════════════════════════════════════════
   RANGEELA DHABA — PREMIUM HOMEPAGE
   Elegant, sophisticated design inspired by premium restaurant experiences
═══════════════════════════════════════════════════════════════════════════ */

// Restaurant Info
const RESTAURANT_INFO = {
  name: "Rangeela Dhaba",
  tagline: "Authentic Bengali Cuisine",
  address: "Bablatala Link Road, Kolkata 700136",
  phone: "+91 82409 21497",
  googleMapsUrl: "https://maps.app.goo.gl/epVDq1DsjFoYJ2fCA",
  openingHours: {
    weekdays: "11:00 AM - 11:00 PM",
    weekends: "10:00 AM - 11:30 PM",
  },
};

// Features data
const features = [
  {
    icon: Utensils,
    title: "Authentic Taste",
    description: "Traditional Bengali recipes passed down through generations, cooked with love.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Hot and fresh food delivered to your doorstep within 30-60 minutes.",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "We use only the freshest, locally sourced ingredients in every dish.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Each dish is prepared with passion by our experienced Bengali chefs.",
  },
];

const Index = () => {
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [foodFilter, setFoodFilter] = useState<'all' | 'veg' | 'nonveg' | 'southindian'>('all');
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, bannerData, reviewsData] = await Promise.all([
          fetchProducts(),
          fetchGallery().catch(() => []),
          getTopReviews(6).catch(() => []),
        ]);
        setProducts(prods);
        setBanners(bannerData || []);
        setTestimonials(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Refresh when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Get featured dishes (top rated) - show 8 for better browsing
  const featuredDishes = useMemo(() => {
    let filtered = [...products];

    // Apply veg/non-veg/south indian filter
    if (foodFilter === 'veg') {
      filtered = filtered.filter(item => item.isVeg === true);
    } else if (foodFilter === 'nonveg') {
      filtered = filtered.filter(item => item.isVeg === false);
    } else if (foodFilter === 'southindian') {
      filtered = filtered.filter(item =>
        item.category?.toLowerCase().includes('south indian') ||
        item.category?.toLowerCase() === 'south indian' ||
        item.name?.toLowerCase().includes('dosa') ||
        item.name?.toLowerCase().includes('idli') ||
        item.name?.toLowerCase().includes('vada') ||
        item.name?.toLowerCase().includes('uttapam') ||
        item.name?.toLowerCase().includes('sambar')
      );
    }

    return filtered
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [products, foodFilter]);

  const heroImage = banners[currentBanner]?.imageUrl ||
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&h=800&fit=crop";

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — Elegant Dark with Golden Accents
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          {/* Overlay Gradients - Darker for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Content */}
        <div className="relative h-full container-custom flex items-center">
          <div className="max-w-2xl animate-fade-up">
            {/* Decorative Element */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                Authentic Bengali Cuisine
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Rangeela Dhaba</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-lg">
              A perfect blend of Indian, Chinese, Tandoor & South Indian cuisines. Freshly cooked, full of flavor & delivered hot to your doorstep
            </p>

            {/* CTA Button */}
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-foreground font-bold text-base rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg group"
            >
              Order Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Banner Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentBanner
                    ? "bg-primary w-8"
                    : "bg-background/50 hover:bg-background/75"
                )}
              />
            ))}
          </div>
        )}

        {/* Decorative Bottom Wave */}
        <div className="wave-decoration">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BEST SELLERS — Popular Items (FIRST - Users want food!)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          {/* Section Header with Veg/Non-Veg Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            {/* Veg/Non-Veg Toggle Buttons */}
            <div className="flex items-center gap-2 p-1 bg-secondary rounded-xl">
              {/* All Button */}
              <button
                onClick={() => setFoodFilter('all')}
                className={cn(
                  "px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300",
                  foodFilter === 'all'
                    ? "bg-gradient-to-r from-primary to-accent text-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>

              {/* Veg Button */}
              <button
                onClick={() => setFoodFilter('veg')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300",
                  foodFilter === 'veg'
                    ? "bg-veg text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center",
                  foodFilter === 'veg' ? "border-white bg-white/20" : "border-veg"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    foodFilter === 'veg' ? "bg-white" : "bg-veg"
                  )} />
                </span>
                Veg
              </button>

              {/* Non-Veg Button */}
              <button
                onClick={() => setFoodFilter('nonveg')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300",
                  foodFilter === 'nonveg'
                    ? "bg-non-veg text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center",
                  foodFilter === 'nonveg' ? "border-white bg-white/20" : "border-non-veg"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    foodFilter === 'nonveg' ? "bg-white" : "bg-non-veg"
                  )} />
                </span>
                Non-Veg
              </button>

              {/* South Indian Button */}
              <button
                onClick={() => setFoodFilter('southindian')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300",
                  foodFilter === 'southindian'
                    ? "bg-amber-500 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-base">🍛</span>
                South Indian
              </button>
            </div>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              View Full Menu
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50">
                  <div className="aspect-[4/3] bg-muted animate-shimmer" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-muted animate-shimmer rounded" />
                    <div className="h-4 w-1/2 bg-muted animate-shimmer rounded" />
                    <div className="h-8 w-1/3 bg-muted animate-shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredDishes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Utensils className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                No {foodFilter === 'veg' ? 'vegetarian' : foodFilter === 'nonveg' ? 'non-vegetarian' : 'South Indian'} dishes found
              </p>
              <button
                onClick={() => setFoodFilter('all')}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Show All Dishes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredDishes.slice(0, 8).map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard item={item} />
                </div>
              ))}
            </div>
          )}

          {/* Quick Browse Categories */}
          <div className="mt-8 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">Browse by category:</p>
            <div className="flex flex-wrap gap-2">
              {["Biryani", "Bengali", "South Indian", "Chinese", "Rolls", "Sweets", "Drinks"].map((cat) => (
                <Link
                  key={cat}
                  to={`/menu?category=${cat}`}
                  className="px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-full hover:bg-primary hover:text-white transition-all duration-200"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHY CHOOSE US — Feature Cards (After food)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center mb-10">
            <span className="label-premium mb-2 block">
              Why People Love Us
            </span>
            <h2 className="section-title mb-3">
              What Makes Us Special
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              We take pride in delivering an exceptional dining experience with every order
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card text-center group p-4 md:p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-serif text-base md:text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ABOUT SECTION — Our Story
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="image-decorated">
                <img
                  src="/restro.jpeg"
                  alt="Restaurant Interior"
                  className="rounded-2xl shadow-medium w-full relative z-10"
                />
              </div>

              {/* Floating Card */}
              <div className="floating-card -bottom-6 -right-6 md:right-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-serif font-semibold text-foreground">Since 2020</p>
                    <p className="text-sm text-muted-foreground">Serving with Love</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div>
              <span className="label-premium mb-3 block">
                Our Story
              </span>
              <h2 className="section-title mb-6">
                About Rangeela Dhaba
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Welcome to Rangeela Dhaba, a vibrant multi-cuisine restaurant founded by Rahul Saha in 2020.
                We bring you the authentic taste of India with a colorful twist - from rich North Indian curries
                to sizzling tandoori dishes, Chinese delights, and classic dhaba-style meals.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                At Rangeela Dhaba, every dish is prepared with fresh ingredients, homely flavors, and a touch of love.
                Whether you're here for a family dinner, a casual meal with friends, or a quick takeaway, we promise
                great taste, warm hospitality, and a memorable dining experience.
              </p>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-card hover:border-primary/50 hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm flex items-center gap-1">
                      Location
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </p>
                    <p className="text-muted-foreground text-sm">{RESTAURANT_INFO.address}</p>
                  </div>
                </a>
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="info-card hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Call Us</p>
                    <p className="text-muted-foreground text-sm">{RESTAURANT_INFO.phone}</p>
                  </div>
                </a>
                <div className="info-card sm:col-span-2">
                  <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Opening Hours</p>
                    <p className="text-muted-foreground text-sm">
                      Mon-Fri: {RESTAURANT_INFO.openingHours.weekdays} |
                      Sat-Sun: {RESTAURANT_INFO.openingHours.weekends}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CUSTOMER REVIEWS — Testimonials
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="label-premium mb-3 block">
              Testimonials
            </span>
            <h2 className="section-title mb-4">
              What Our Customers Say
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Real reviews from real food lovers
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(testimonials.length > 0
              ? testimonials.slice(0, 3).map((review) => ({
                  name: review.user?.name || "Happy Customer",
                  text: review.comment || "Great food and service!",
                  rating: review.rating,
                  dish: review.dish?.name || "Delicious Dish",
                }))
              : [
                  {
                    name: "Anindita Roy",
                    text: "The Kosha Mangsho reminds me of my grandmother's cooking. Absolutely authentic Bengali taste!",
                    rating: 5,
                    dish: "Kosha Mangsho",
                  },
                  {
                    name: "Rajesh Banerjee",
                    text: "Best fish curry in the area. The mustard oil and spices are perfectly balanced.",
                    rating: 5,
                    dish: "Machher Jhol",
                  },
                  {
                    name: "Suchitra Das",
                    text: "Quick delivery, hot food, and the Mishti Doi is to die for. My family's favorite!",
                    rating: 5,
                    dish: "Mishti Doi",
                  },
                ]
            ).map((review, index) => (
              <div
                key={index}
                className="feature-card text-left animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6 italic">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="font-semibold text-foreground">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ordered {review.dish}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION — Order Now
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=600&fit=crop)`
          }}
        >
          <div className="absolute inset-0 bg-foreground/85" />
        </div>

        {/* Content */}
        <div className="relative container-custom text-center">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4">
            Ready to taste authentic Bengali food?
          </h2>
          <p className="text-background/80 max-w-xl mx-auto mb-8 text-lg">
            Order now and enjoy the flavors of Kolkata delivered fresh to your doorstep.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/menu" className="btn-premium group">
              Order Now
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-background/10 backdrop-blur-sm text-background font-semibold rounded-lg border border-background/30 hover:bg-background/20 transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          LOCATION INFO — Footer Banner
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-8 bg-secondary/50 border-t border-border/50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <a
              href={RESTAURANT_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span>{RESTAURANT_INFO.address}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Open daily: 11 AM - 11 PM</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span>{RESTAURANT_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
