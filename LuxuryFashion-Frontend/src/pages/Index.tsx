import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Sparkles
} from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { fetchProducts } from "@/data/foodData";
import { fetchGallery } from "@/lib/api";
import type { FoodItem } from "@/data/foodData";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  FloatingParticles,
  GradientText,
  Magnetic,
  ImageReveal,
  Marquee,
  AnimatedCounter,
  ScrollTextReveal,
  Float,
} from "@/components/animations";

/* ═══════════════════════════════════════════════════════════════════════════
   RANGEELA DHABA — PREMIUM HOMEPAGE
   Elegant, sophisticated design inspired by premium restaurant experiences
═══════════════════════════════════════════════════════════════════════════ */

// Restaurant Info
const RESTAURANT_INFO = {
  name: "Rangeela Dhaba",
  tagline: "Authentic Bengali Cuisine",
  address: "Park Street, Kolkata 700017",
  phone: "+91 89812 60291",
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, bannerData] = await Promise.all([
          fetchProducts(),
          fetchGallery().catch(() => []),
        ]);
        setProducts(prods);
        setBanners(bannerData || []);
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

  // Parallax scroll effect for hero
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — Cinematic Parallax with 3D Depth
      ═══════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[100vh] min-h-[600px] overflow-hidden">
        {/* Background Image with Deep Parallax */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
            y: heroY,
            scale: heroScale,
          }}
        >
          {/* Animated Gradient Overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>

        {/* Floating particles */}
        <FloatingParticles count={30} color="rgba(245, 158, 11, 0.3)" />

        {/* Content with Parallax */}
        <motion.div
          className="relative h-full container-custom flex items-center"
          style={{ y: textY, opacity: heroOpacity }}
        >
          <div className="max-w-3xl">
            {/* Animated Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-white/90 text-sm font-medium">Authentic Bengali Cuisine Since 2009</span>
            </motion.div>

            {/* Main Title with Reveal Animation */}
            <div className="overflow-hidden mb-6">
              <motion.h1
                className="font-serif text-5xl md:text-6xl lg:text-8xl font-bold text-white leading-[1.1]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Taste of
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-8">
              <motion.h1
                className="font-serif text-5xl md:text-6xl lg:text-8xl font-bold leading-[1.1]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <GradientText colors={["#f59e0b", "#ea580c", "#fbbf24", "#f59e0b"]}>
                  Bengal
                </GradientText>
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.p
              className="text-white/70 text-lg md:text-xl mb-10 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              Experience the rich, aromatic flavors of authentic Bengali cuisine.
              From spicy fish curries to sweet mishti doi.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <Magnetic strength={0.3}>
                <Link
                  to="/menu"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent text-foreground font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
                >
                  <span className="relative z-10">Explore Menu</span>
                  <motion.span
                    className="relative z-10"
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Link>
              </Magnetic>

              <Magnetic strength={0.3}>
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  Order by Phone
                </a>
              </Magnetic>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <div>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={15} suffix="+" />
                </div>
                <div className="text-white/60 text-sm">Years of Excellence</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={50} suffix="+" />
                </div>
                <div className="text-white/60 text-sm">Authentic Dishes</div>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={10} suffix="K+" />
                </div>
                <div className="text-white/60 text-sm">Happy Customers</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-white/50 text-sm">Scroll to explore</span>
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-3 bg-primary rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MARQUEE SECTION — Scrolling Text Banner
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-6 bg-primary overflow-hidden">
        <Marquee speed={30} className="text-foreground">
          <span className="flex items-center gap-8 px-8">
            <span className="text-2xl font-serif font-bold">Authentic Bengali Cuisine</span>
            <Star className="w-6 h-6 fill-current" />
            <span className="text-2xl font-serif font-bold">Fresh Ingredients Daily</span>
            <Star className="w-6 h-6 fill-current" />
            <span className="text-2xl font-serif font-bold">Fast Delivery</span>
            <Star className="w-6 h-6 fill-current" />
            <span className="text-2xl font-serif font-bold">Family Recipes</span>
            <Star className="w-6 h-6 fill-current" />
          </span>
        </Marquee>
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
      <section className="py-12 md:py-16 bg-secondary/30 relative overflow-hidden">
        {/* Background Particles */}
        <FloatingParticles count={15} color="rgba(245, 158, 11, 0.1)" />

        <div className="container-custom relative z-10">
          {/* Section Header */}
          <FadeIn direction="up" className="text-center mb-10">
            <span className="label-premium mb-2 block">
              Why People Love Us
            </span>
            <h2 className="section-title mb-3">
              What Makes Us Special
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              We take pride in delivering an exceptional dining experience with every order
            </p>
          </FadeIn>

          {/* Features Grid with Stagger */}
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" staggerDelay={0.15}>
            {features.map((feature, index) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  className="feature-card text-center group p-4 md:p-6 h-full"
                  whileHover={{ y: -8, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.15)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </motion.div>
                  <h3 className="font-serif text-base md:text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ABOUT SECTION — Our Story
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <FadeIn direction="left" className="relative">
              <div className="image-decorated">
                <motion.img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"
                  alt="Restaurant Interior"
                  className="rounded-2xl shadow-medium w-full relative z-10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Floating Card */}
              <Float duration={3} distance={8}>
                <motion.div
                  className="floating-card -bottom-6 -right-6 md:right-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <ChefHat className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div>
                      <p className="font-serif font-semibold text-foreground">15+ Years</p>
                      <p className="text-sm text-muted-foreground">of Excellence</p>
                    </div>
                  </div>
                </motion.div>
              </Float>
            </FadeIn>

            {/* Content Side */}
            <FadeIn direction="right">
              <span className="label-premium mb-3 block">
                Our Story
              </span>
              <h2 className="section-title mb-6">
                About <GradientText colors={["#f59e0b", "#ea580c", "#f59e0b"]}>Rangeela Dhaba</GradientText>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Welcome to Rangeela Dhaba, where tradition meets taste. Founded with a passion for authentic
                Bengali cuisine, we bring you the rich flavors of Kolkata right to your table. Our chefs,
                with decades of experience, craft each dish using time-honored recipes and the freshest ingredients.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                From the aromatic Kosha Mangsho to the delicate Machher Jhol, every dish tells
                a story of Bengal's diverse culinary heritage. We believe in serving not just food, but
                an experience that transports you to the heart of Kolkata's hospitality.
              </p>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="info-card">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Location</p>
                    <p className="text-muted-foreground text-sm">{RESTAURANT_INFO.address}</p>
                  </div>
                </div>
                <div className="info-card">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Call Us</p>
                    <p className="text-muted-foreground text-sm">{RESTAURANT_INFO.phone}</p>
                  </div>
                </div>
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
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CUSTOMER REVIEWS — Testimonials
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          {/* Section Header */}
          <FadeIn direction="up" className="text-center mb-12 md:mb-16">
            <span className="label-premium mb-3 block">
              Testimonials
            </span>
            <h2 className="section-title mb-4">
              What Our Customers Say
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Real reviews from real food lovers
            </p>
          </FadeIn>

          {/* Reviews Grid with Stagger */}
          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.2}>
            {[
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
            ].map((review, index) => (
              <StaggerItem key={index}>
                <motion.div
                  className="feature-card text-left h-full"
                  whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION — Order Now
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background with Parallax Effect */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=600&fit=crop)`
          }}
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 bg-foreground/85" />
        </motion.div>

        {/* Floating particles */}
        <FloatingParticles count={10} color="rgba(245, 158, 11, 0.2)" />

        {/* Content */}
        <div className="relative container-custom text-center">
          <FadeIn direction="up">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4">
              Ready to taste authentic Bengali food?
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <p className="text-background/80 max-w-xl mx-auto mb-8 text-lg">
              Order now and enjoy the flavors of Kolkata delivered fresh to your doorstep.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Magnetic strength={0.15}>
                <Link to="/menu" className="btn-premium group">
                  <motion.span whileHover={{ x: -3 }}>Order Now</motion.span>
                  <motion.span whileHover={{ x: 3 }}>
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Link>
              </Magnetic>
              <Magnetic strength={0.15}>
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-background/10 backdrop-blur-sm text-background font-semibold rounded-lg border border-background/30 hover:bg-background/20 transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
              </Magnetic>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          LOCATION INFO — Footer Banner
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-8 bg-secondary/50 border-t border-border/50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{RESTAURANT_INFO.address}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Open daily: 11 AM - 11 PM</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <a href={`tel:${RESTAURANT_INFO.phone}`} className="hover:text-primary transition-colors">
                {RESTAURANT_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
