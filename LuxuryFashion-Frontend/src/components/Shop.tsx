import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Search, User, Menu, X, Heart, Truck, Award, Shield, ArrowRight, TrendingUp, Users, Globe } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category?: string;
}

interface FashionHomepageProps {
  products?: Product[];
  cartCount?: number;
  isLoggedIn?: boolean;
}

const FashionHomepage: React.FC<FashionHomepageProps> = ({ 
  products = [], 
  cartCount = 0,
  isLoggedIn = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Premium fashion hero images
  const heroImages = [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  ];

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoading(false), 2000);

    const counterInterval = setInterval(() => {
      setSubscriberCount(prev => {
        if (prev >= 150000) {
          clearInterval(counterInterval);
          return 150000;
        }
        return prev + 2500;
      });
    }, 50);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(counterInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoplay, heroImages.length]);

  const defaultProducts: Product[] = [
    {
      id: '1',
      name: 'Cashmere Oversized Coat',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      badge: 'New',
      rating: 4.9,
      reviewCount: 124,
      brand: 'LUNA',
      category: 'Outerwear'
    },
    {
      id: '2',
      name: 'Silk Midi Dress',
      price: 899,
      originalPrice: 1199,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      badge: 'Sale',
      rating: 4.8,
      reviewCount: 89,
      brand: 'AURORA',
      category: 'Dresses'
    },
    {
      id: '3',
      name: 'Leather Ankle Boots',
      price: 649,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 4.7,
      reviewCount: 156,
      brand: 'TERRA',
      category: 'Footwear'
    },
    {
      id: '4',
      name: 'Minimalist Gold Necklace',
      price: 299,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      badge: 'Trending',
      rating: 4.9,
      reviewCount: 203,
      brand: 'LUMINA',
      category: 'Jewelry'
    },
    {
      id: '5',
      name: 'Tailored Blazer',
      price: 799,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 4.8,
      reviewCount: 67,
      brand: 'ELITE',
      category: 'Blazers'
    },
    {
      id: '6',
      name: 'Designer Handbag',
      price: 1199,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      badge: 'Limited',
      rating: 4.9,
      reviewCount: 98,
      brand: 'NOVA',
      category: 'Bags'
    }
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroImages.length);
    setIsAutoplay(false);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length);
    setIsAutoplay(false);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
    }
    
    return stars;
  };

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'New':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
      case 'Sale':
        return 'bg-gradient-to-r from-rose-500 to-pink-500 text-white';
      case 'Limited':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      case 'Trending':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      default:
        return 'bg-black text-white';
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* Custom CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes luxury-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
          50% { box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15); }
        }
        
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 1s ease-out; }
        .animate-gentle-float { animation: gentle-float 3s ease-in-out infinite; }
        .animate-luxury-glow { animation: luxury-glow 3s ease-in-out infinite; }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .luxury-gradient {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .text-shadow-luxury {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      {/* Minimal Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-8"></div>
            <div className="text-black text-2xl font-serif font-medium tracking-widest">
              ÉLÉGANCE
            </div>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-40 border-b border-gray-100 transition-all duration-300">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl md:text-3xl font-serif font-medium text-black tracking-widest hover:scale-105 transition-transform duration-300 cursor-pointer">
              ÉLÉGANCE
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-12">
              {['Women', 'Men', 'Accessories', 'New Arrivals', 'Sale'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="relative text-gray-700 hover:text-black transition-colors duration-300 font-medium text-sm tracking-wide group"
                >
                  {item}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-700 hover:text-black transition-colors duration-300">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-700 hover:text-black transition-colors duration-300 hidden md:block">
                <User className="w-5 h-5" />
              </button>
              <button className="relative p-2 text-gray-700 hover:text-black transition-colors duration-300">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                className="lg:hidden p-2 text-gray-700 hover:text-black transition-colors duration-300"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 lg:hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="text-2xl font-serif font-medium text-black tracking-widest">
                ÉLÉGANCE
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-700 hover:text-black transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col space-y-8 p-6">
              {['Women', 'Men', 'Accessories', 'New Arrivals', 'Sale'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-2xl font-serif text-gray-700 hover:text-black transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={`Fashion ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}
          </div>

          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-white leading-tight mb-8 animate-fade-in-up text-shadow-luxury">
                Timeless
                <span className="block text-amber-300">
                  Elegance
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light mb-12 animate-fade-in-up max-w-lg">
                Discover curated fashion pieces that define contemporary luxury and sophisticated style
              </p>
              <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up">
                <button className="bg-white text-black px-8 py-4 font-medium text-sm tracking-wide hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 uppercase">
                  Shop Collection
                </button>
                <button className="border-2 border-white text-white px-8 py-4 font-medium text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 uppercase">
                  View Lookbook
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 glass-effect rounded-full text-white hover:bg-white/20 transition-all duration-300 z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 glass-effect rounded-full text-white hover:bg-white/20 transition-all duration-300 z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-12 h-1 transition-all duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-black mb-6">
                Shop by Category
              </h2>
              <div className="w-24 h-0.5 bg-black mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                Explore our carefully curated collections
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  name: 'Women', 
                  image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  count: '240+ Items'
                },
                { 
                  name: 'Men', 
                  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  count: '180+ Items'
                },
                { 
                  name: 'Accessories', 
                  image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  count: '120+ Items'
                },
                { 
                  name: 'Footwear', 
                  image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  count: '90+ Items'
                }
              ].map((category, index) => (
                <div
                  key={category.name}
                  className="group relative overflow-hidden bg-white rounded-none shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden h-80">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"></div>
                    
                    <div className="absolute inset-0 flex items-end justify-center p-8">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-2xl font-serif font-medium text-white mb-2 text-shadow-luxury">
                          {category.name}
                        </h3>
                        <p className="text-white/80 font-light">
                          {category.count}
                        </p>
                        <button className="mt-4 bg-white text-black px-6 py-2 text-sm font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 uppercase">
                          Explore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-black mb-6">
                Featured Pieces
              </h2>
              <div className="w-24 h-0.5 bg-black mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                Handpicked selections from our latest collections
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Product Badge */}
                    {product.badge && (
                      <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-medium tracking-wide ${getBadgeStyles(product.badge)} uppercase`}>
                        {product.badge}
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    {/* Quick Shop Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <button className="bg-white text-black px-8 py-3 font-medium text-sm tracking-wide hover:bg-gray-100 transition-colors duration-300 uppercase transform scale-95 group-hover:scale-100">
                        Quick Shop
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      {product.brand && (
                        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-1">
                          {product.brand}
                        </p>
                      )}
                      <h3 className="text-lg font-serif font-medium text-black mb-2 group-hover:text-gray-700 transition-colors duration-300">
                        {product.name}
                      </h3>
                    </div>

                    {product.rating && (
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex space-x-1">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-gray-600 text-sm">
                          ({product.reviewCount})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl font-serif font-medium text-black">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-gray-400 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.category && (
                        <span className="text-gray-500 text-xs uppercase tracking-wide">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <button className="bg-black text-white px-12 py-4 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 uppercase">
                View All Products
              </button>
            </div>
          </div>
        </section>

        {/* Editorial Banner */}
        <section className="py-0 bg-gray-900 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-96 lg:h-[600px]">
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Editorial Fashion"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            <div className="flex items-center justify-center p-12 lg:p-20 bg-gray-900">
              <div className="text-center lg:text-left max-w-lg">
                <h2 className="text-4xl md:text-5xl font-serif font-medium text-white mb-8 leading-tight">
                  Spring/Summer
                  <span className="block text-amber-300">Collection 2025</span>
                </h2>
                <p className="text-xl text-gray-300 font-light leading-relaxed mb-10">
                  Embrace the season with our latest collection featuring sustainable luxury and contemporary elegance
                </p>
                <button className="group border-2 border-white text-white px-8 py-4 font-medium text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300 uppercase">
                  <span className="flex items-center space-x-3">
                    <span>Discover Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Values */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-black mb-6">
                Our Promise
              </h2>
              <div className="w-24 h-0.5 bg-black mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: Shield,
                  title: 'Quality Assurance',
                  description: 'Every piece is crafted with premium materials and meticulous attention to detail'
                },
                {
                  icon: Truck,
                  title: 'Worldwide Delivery',
                  description: 'Complimentary shipping on orders over $200 with express delivery options'
                },
                {
                  icon: Award,
                  title: 'Sustainable Luxury',
                  description: 'Committed to ethical fashion practices and environmental responsibility'
                }
              ].map((value, index) => (
                <div key={value.title} className="text-center group">
                  <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-black mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram-style Gallery */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-black mb-6">
                Style Stories
              </h2>
              <div className="w-24 h-0.5 bg-black mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 font-light">
                Follow @elegance for daily inspiration
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
              ].map((image, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden bg-gray-100 aspect-square group cursor-pointer transform hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={image}
                    alt={`Style ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: `${subscriberCount.toLocaleString()}+`, label: 'Global Customers', icon: Users },
                { value: '500+', label: 'Premium Pieces', icon: Award },
                { value: '50+', label: 'Luxury Brands', icon: Star },
                { value: '30+', label: 'Countries', icon: Globe }
              ].map((stat, index) => (
                <div key={stat.label} className="group">
                  <div className="w-12 h-12 bg-white rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-black" />
                  </div>
                  <div className="text-3xl font-serif font-medium mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-light text-sm uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-black mb-6">
                Stay in Style
              </h2>
              <p className="text-xl text-gray-600 font-light mb-12 leading-relaxed">
                Be the first to discover new collections, exclusive offers, and style insights
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 text-gray-900 font-light"
                />
                <button className="bg-black text-white px-8 py-4 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 uppercase whitespace-nowrap">
                  Subscribe
                </button>
              </div>

              <div className="flex items-center justify-center space-x-8 text-gray-500 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Protected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Style Updates</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="text-2xl font-serif font-medium text-black tracking-widest">
                ÉLÉGANCE
              </div>
              <p className="text-gray-600 font-light leading-relaxed">
                Curating timeless fashion for the modern connoisseur of style and sophistication
              </p>
              <div className="flex space-x-4">
                {['Instagram', 'Pinterest', 'Twitter'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-100 hover:bg-black hover:text-white transition-all duration-300 rounded-full flex items-center justify-center text-gray-600 text-sm"
                  >
                    {social.charAt(0)}
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Shop',
                links: ['Women', 'Men', 'Accessories', 'New Arrivals', 'Sale']
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Press', 'Sustainability', 'Contact']
              },
              {
                title: 'Support',
                links: ['Size Guide', 'Shipping', 'Returns', 'Care Guide', 'FAQ']
              }
            ].map((section) => (
              <div key={section.title} className="space-y-6">
                <h3 className="font-serif font-medium text-black text-lg">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="block text-gray-600 hover:text-black transition-colors duration-300 font-light"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-500 font-light text-sm">
                © 2025 Élégance. All rights reserved.
              </div>
              <div className="flex items-center space-x-8 text-sm">
                <a href="#" className="text-gray-500 hover:text-black transition-colors duration-300 font-light">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-500 hover:text-black transition-colors duration-300 font-light">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-500 hover:text-black transition-colors duration-300 font-light">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Cart Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-30 animate-luxury-glow">
        <ShoppingBag className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FashionHomepage;