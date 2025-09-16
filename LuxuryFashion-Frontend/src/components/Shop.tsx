import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Heart, Truck, Award, Shield, ArrowRight, TrendingUp, Users, Globe, X, Plus, Minus, Eye } from 'lucide-react';
import { fetchGalleryImages, fetchProductsshop } from '../api/ProductApi';
import type { BackendProduct, Gallerydata, Product } from '../api/base';
import { Link } from 'react-router-dom';

interface FashionHomepageProps {
    apiEndpoint?: string;
}

const FashionHomepage: React.FC<FashionHomepageProps> = ({

}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [scrollY, setScrollY] = useState(0);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const heroRef = useRef<HTMLDivElement>(null);
      const [galleryImages, setGalleryImages] = useState<string[]>([]);

     
    
   const fallbackHeroImages: string[] = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
];


useEffect(() => {
  const loadGalleryImages = async () => {
    try {
      const apiImages = await fetchGalleryImages(); // returns Gallerydata[]
      const urls = apiImages
        ?.map((img) => img.imageUrl)
        .filter((url): url is string => !!url && url.trim() !== "") ?? [];

      if (urls.length === 0) {
        // No backend images
        setGalleryImages(fallbackHeroImages);
      } else if (urls.length < fallbackHeroImages.length) {
        // Merge backend + fallback
        const merged = [...urls, ...fallbackHeroImages.slice(urls.length)];
        setGalleryImages(merged);
      } else {
        // Only backend
        setGalleryImages(urls);
      }
    } catch (error) {
      console.error("Error loading gallery images, using fallback:", error);
      setGalleryImages(fallbackHeroImages);
    } finally {
      setIsLoading(false);
    }
  };

  loadGalleryImages();
}, []);



const fetchProducts = async () => {
  try {
    setIsLoadingProducts(true);
    const products = await fetchProductsshop(); 

   
    setProducts(products.slice(0, 3));

  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    setIsLoadingProducts(false);
  }
};

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

        // Fetch products on component mount
        fetchProducts();

        return () => {
            clearTimeout(loadingTimer);
            clearInterval(counterInterval);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

useEffect(() => {
  if (!isAutoplay || galleryImages.length === 0) return;
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  }, 6000);
  return () => clearInterval(interval);
}, [isAutoplay, galleryImages.length]);

const nextSlide = () => {
  if (galleryImages.length > 0) {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    setIsAutoplay(false);
  }
};

const prevSlide = () => {
  if (galleryImages.length > 0) {
    setCurrentSlide(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
    );
    setIsAutoplay(false);
  }
};

const toggleWishlist = (productId: string) => {
  setWishlist((prev) =>
    prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]
  );
};


    const openProductPreview = (product: Product) => {
        setSelectedProduct(product);
        setSelectedSize(product.sizes?.[0] || '');
        setSelectedColor(product.colors?.[0] || '');
        setQuantity(product.quantity || 1);
        setCurrentImageIndex(0);
        document.body.style.overflow = 'hidden';
    };

    const closeProductPreview = () => {
        setSelectedProduct(null);
        document.body.style.overflow = 'unset';
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
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

    const displayProducts = products.length > 0 ? products : [];

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

            {/* Product Preview Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Product Images */}
                            <div className="relative">
                                <button
                                    onClick={closeProductPreview}
                                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={selectedProduct.images?.[currentImageIndex] || selectedProduct.image}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {selectedProduct.images && selectedProduct.images.length > 1 && (
                                    <div className="flex space-x-2 p-4 overflow-x-auto">
                                        {selectedProduct.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 ${
                                                    currentImageIndex === index ? 'border-black' : 'border-gray-200'
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${selectedProduct.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="p-8">
                                <div className="mb-6">
                                    {selectedProduct.brand && (
                                        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-2">
                                            {selectedProduct.brand}
                                        </p>
                                    )}
                                    <h2 className="text-3xl font-serif font-medium text-black mb-4">
                                        {selectedProduct.name}
                                    </h2>
                                    
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl font-serif font-medium text-black">
                                                ${selectedProduct.price}
                                            </span>
                                            {selectedProduct.originalPrice && (
                                                <span className="text-gray-400 line-through text-lg">
                                                    ${selectedProduct.originalPrice}
                                                </span>
                                            )}
                                        </div>
                                        {selectedProduct.badge && (
                                            <span className={`px-3 py-1 text-xs font-medium tracking-wide ${getBadgeStyles(selectedProduct.badge)} uppercase`}>
                                                {selectedProduct.badge}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {selectedProduct.rating && (
                                        <div className="flex items-center space-x-2 mb-6">
                                            <div className="flex space-x-1">
                                                {renderStars(selectedProduct.rating)}
                                            </div>
                                            <span className="text-gray-600 text-sm">
                                                ({selectedProduct.reviewCount} reviews)
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {selectedProduct.description && (
                                    <p className="text-gray-600 leading-relaxed mb-8">
                                        {selectedProduct.description}
                                    </p>
                                )}
                                
                                {/* Size Selection */}
                                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-black mb-3">
                                            Size
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProduct.sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-4 py-2 border text-sm font-medium transition-colors ${
                                                        selectedSize === size
                                                            ? 'border-black bg-black text-white'
                                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Color Selection */}
                                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-black mb-3">
                                            Color
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProduct.colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`px-4 py-2 border text-sm font-medium transition-colors ${
                                                        selectedColor === color
                                                            ? 'border-black bg-black text-white'
                                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                    }`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Quantity */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-black mb-3">
                                        Quantity
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="p-2 border border-gray-300 hover:border-gray-400 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-lg font-medium min-w-8 text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="p-2 border border-gray-300 hover:border-gray-400 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Add to Cart Button */}
                                <div className="space-y-4">
                                    <button className="w-full bg-black text-white py-4 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 uppercase">
                                        Add to Cart - ${(selectedProduct.price * quantity).toLocaleString()}
                                    </button>
                                    <button
                                        onClick={() => toggleWishlist(selectedProduct.id)}
                                        className={`w-full border-2 py-4 font-medium text-sm tracking-wide transition-colors duration-300 uppercase flex items-center justify-center space-x-2 ${
                                            wishlist.includes(selectedProduct.id)
                                                ? 'border-red-500 text-red-500'
                                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        <Heart className={`w-4 h-4 ${wishlist.includes(selectedProduct.id) ? 'fill-current' : ''}`} />
                                        <span>{wishlist.includes(selectedProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

     <main className="pt-16">
  {/* Hero Section */}
  <section
    ref={heroRef}
    className="relative h-screen flex items-center overflow-hidden"
  >
<div className="absolute inset-0">
  {galleryImages.map((image, index) => (
    <div
      key={index}
      className={`absolute inset-0 transition-all duration-1000 ${
        index === currentSlide ? "opacity-100" : "opacity-0"
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
          <span className="block text-amber-300">Elegance</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light mb-12 animate-fade-in-up max-w-lg">
          Discover curated fashion pieces that define contemporary luxury and
          sophisticated style
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
      {galleryImages.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentSlide(index)}
          className={`w-12 h-1 transition-all duration-300 ${
            index === currentSlide
              ? "bg-white"
              : "bg-white/30 hover:bg-white/50"
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
      slug: 'women',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: '240+ Items'
    },
    {
      name: 'Men',
      slug: 'men',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: '180+ Items'
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: '120+ Items'
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      count: '90+ Items'
    }
  ].map((category, index) => (
    <Link
      to={`/category/${category.slug}`}
      key={category.name}
      className="group relative overflow-hidden bg-white rounded-none shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 block"
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
    </Link>
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
                            {isLoadingProducts && (
                                <p className="text-gray-500 mt-4">Loading products...</p>
                            )}
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

                                        {/* Quick Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <div className="flex space-x-3">
                                                <button 
                                                    onClick={() => openProductPreview(product)}
                                                    className="bg-white text-black px-6 py-3 font-medium text-sm tracking-wide hover:bg-gray-100 transition-colors duration-300 uppercase transform scale-95 group-hover:scale-100 flex items-center space-x-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Quick View</span>
                                                </button>
                                                <button className="border-2 border-white text-white px-6 py-3 font-medium text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300 uppercase transform scale-95 group-hover:scale-100">
                                                    Add to Cart
                                                </button>
                                            </div>
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

                                        {/* Stock Status */}
                                        <div className="mt-3">
                                            {product.inStock ? (
                                                <span className="text-emerald-600 text-xs font-medium uppercase tracking-wide">
                                                    In Stock
                                                </span>
                                            ) : (
                                                <span className="text-red-600 text-xs font-medium uppercase tracking-wide">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-16">
                            <button className="bg-black text-white px-12 py-4 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 uppercase">
                               To Browse Products Search
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
        alt="Indian Fashion"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30"></div>
    </div>
    <div className="flex items-center justify-center p-12 lg:p-20 bg-gray-900">
      <div className="text-center lg:text-left max-w-lg">
        <h2 className="text-4xl md:text-5xl font-serif font-medium text-white mb-8 leading-tight">
          Timeless Style
          <span className="block text-amber-300">All Seasons 2025</span>
        </h2>
        <p className="text-xl text-gray-300 font-light leading-relaxed mb-10">
          Celebrate every season with our all-year collection inspired by India’s rich heritage, modern design, and sustainable luxury.
        </p>
        <button className="group border-2 border-white text-white px-8 py-4 font-medium text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300 uppercase">
          <span className="flex items-center space-x-3">
            <span>Explore Collection</span>
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

            {/* Floating Cart Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-30 animate-luxury-glow">
                <ShoppingBag className="w-6 h-6" />
            </button>
        </div>
    );
};

export default FashionHomepage;