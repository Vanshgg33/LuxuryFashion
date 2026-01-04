import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { fetchGallery } from "@/lib/api";

interface ApiBanner {
  _id: string;
  imageUrl: string;
  title?: string;
  isActive: boolean;
  order?: number;
}

interface DisplayBanner {
  url: string;
  title: string;
  isLoaded?: boolean;
}

// Fallback images if no banners are uploaded
const fallbackImages: DisplayBanner[] = [
  {
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80",
    title: "Delicious Food Awaits",
  },
  {
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80",
    title: "Fresh & Authentic",
  },
  {
    url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80",
    title: "Taste the Tradition",
  },
];

export function HeroBanner() {
  const [banners, setBanners] = useState<DisplayBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [usingFallback, setUsingFallback] = useState(false);

  // Preload images for smoother transitions
  const preloadImages = useCallback((urls: string[]) => {
    urls.forEach((url, index) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded((prev) => new Set(prev).add(index));
      };
      img.src = url;
    });
  }, []);

  // Fetch banners from API
  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchGallery();

      if (Array.isArray(data) && data.length > 0) {
        const activeBanners: DisplayBanner[] = data
          .filter((b: ApiBanner) => b.isActive === true)
          .map((b: ApiBanner) => ({
            url: b.imageUrl,
            title: b.title || "Rangeela Dhaba",
          }));

        if (activeBanners.length > 0) {
          setBanners(activeBanners);
          setUsingFallback(false);
          preloadImages(activeBanners.map((b) => b.url));
        } else {
          setBanners(fallbackImages);
          setUsingFallback(true);
          preloadImages(fallbackImages.map((b) => b.url));
        }
      } else {
        setBanners(fallbackImages);
        setUsingFallback(true);
        preloadImages(fallbackImages.map((b) => b.url));
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
      setError("Failed to load banners");
      setBanners(fallbackImages);
      setUsingFallback(true);
      preloadImages(fallbackImages.map((b) => b.url));
    } finally {
      setIsLoading(false);
    }
  }, [preloadImages]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-br from-neutral-900 to-neutral-800 animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading banners...</p>
        </div>
      </section>
    );
  }

  if (error && banners.length === 0) {
    return (
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <p className="text-white/80">{error}</p>
          <button
            onClick={loadBanners}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative h-[500px] md:h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Images */}
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentIndex
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          }`}
        >
          <img
            src={banner.url}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white/90">
                AUTHENTIC BENGALI CUISINE
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              Welcome to
              <br />
              <span className="text-primary">Rangeela Dhaba</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed">
              A perfect blend of Indian, Chinese, Tandoor & South Indian cuisines. Freshly cooked, full of flavor & delivered hot to your doorstep
            </p>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Order Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100"
            style={{ opacity: isPaused ? 1 : 0.5 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100"
            style={{ opacity: isPaused ? 1 : 0.5 }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 h-3 bg-primary"
                  : "w-3 h-3 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {banners.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-primary transition-all duration-100"
            style={{
              width: "100%",
              animation: "progress 5s linear infinite",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
