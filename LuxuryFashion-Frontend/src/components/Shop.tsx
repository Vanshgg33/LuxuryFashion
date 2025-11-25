import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Heart, X, Plus, Minus } from 'lucide-react';
import { fetchGalleryImages, fetchProductsshop } from '../api/ProductApi';
import type { Product } from '../api/base';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import { SizeSelector, getAvailableQuantity, isSizeAvailable } from './SizeSelector';

interface FashionHomepageProps {
    apiEndpoint?: string;
}

const FashionHomepage: React.FC<FashionHomepageProps> = () => {
    const { addToCart, cart, cartCount, refreshCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
    const [showFloatingCart, setShowFloatingCart] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const heroRef = useRef<HTMLDivElement>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('featured');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

     
    
   const fallbackHeroImages: string[] = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
];


// Parallelize API calls for better performance
useEffect(() => {
  const loadInitialData = async () => {
    try {
      // Load both gallery images and products in parallel
      const [apiImages, products] = await Promise.all([
        fetchGalleryImages().catch((error) => {
          console.error("Error loading gallery images, using fallback:", error);
          return [];
        }),
        fetchProductsshop().catch((error) => {
          console.error("Error fetching products:", error);
          return [];
        })
      ]);

      // Process gallery images
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

      // Process products - CRITICAL: Don't hide loading until products are loaded
      if (products.length > 0) {
        setProducts(products);
        setFilteredProducts(products);
      }

      // Only set loading to false AFTER products are loaded
      // This ensures page doesn't show empty state while products are loading
      setIsLoadingProducts(false);
      setIsLoading(false); // Hide main loading screen only after products are ready
    } catch (error) {
      console.error("Error loading initial data:", error);
      // Set fallback values
      setGalleryImages(fallbackHeroImages);
      setIsLoadingProducts(false);
      setIsLoading(false); // Still hide loading even on error to show error state
    }
  };

  loadInitialData();
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

const handleAddToCart = async (product: Product, qty: number = 1, size?: string) => {
  // Check authentication first
  if (!isAuthenticated) {
    setToast({ 
      message: 'Please login to add items to cart', 
      type: 'warning' 
    });
    // Redirect to login after a short delay
    setTimeout(() => {
      navigate('/login');
    }, 1500);
    return;
  }

  // Check if product has sizes and size is required
  const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
  
  // Check if product is out of stock (for products without sizes)
  if (!hasSizes && (product.quantity === undefined || product.quantity <= 0)) {
    setToast({ message: 'This product is out of stock', type: 'error' });
    return;
  }
  
  // For products with sizes, check if all sizes are out of stock
  if (hasSizes) {
    const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: number) => sum + (qty || 0), 0) : 0;
    if (totalStock <= 0) {
      setToast({ message: 'This product is out of stock', type: 'error' });
      return;
    }
    
    if (!size) {
      setToast({ message: 'Please select a size', type: 'warning' });
      return;
    }

    // Validate size availability
    if (!isSizeAvailable(product, size, qty)) {
      const available = getAvailableQuantity(product, size);
      setToast({ 
        message: `Only ${available} items available for size ${size}`, 
        type: 'error' 
      });
      return;
    }
  }

  try {
    await addToCart(parseInt(product.id), qty, product.price, size);
    setToast({ message: 'Item added to cart!', type: 'success' });
    if (selectedProduct) {
      closeProductPreview();
    }
  } catch (error: unknown) {
    console.error('Failed to add to cart:', error);
    const axiosError = error as { response?: { status?: number }; message?: string };
    
    // Handle 401 Unauthorized specifically
    if (axiosError.response?.status === 401 || axiosError.message?.includes('Unauthorized') || axiosError.message?.includes('JWT')) {
      setToast({ 
        message: 'Your session has expired. Please login again.', 
        type: 'warning' 
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }
    
    setToast({ 
      message: axiosError.message || 'Failed to add item to cart. Please try again.', 
      type: 'error' 
    });
  }
};


    const openProductPreview = (product: Product) => {
        setSelectedProduct(product);
        // For sizes object, get first available size
        const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
        if (hasSizes) {
            const firstSize = Object.keys(product.sizes as Record<string, number>).find(size => (product.sizes as Record<string, number>)[size] > 0) || null;
            setSelectedSize(firstSize);
            // Always start with quantity 1, not from backend
            setQuantity(1);
        } else {
            // Auto-select "One Size" for products without defined sizes
            setSelectedSize('One Size');
            // Always start with quantity 1, not from backend
            setQuantity(1);
        }
        setSelectedColor(product.colors?.[0] || '');
        setCurrentImageIndex(0);
        document.body.style.overflow = 'hidden';
    };

    const closeProductPreview = () => {
        setSelectedProduct(null);
        document.body.style.overflow = 'unset';
    };

    const handleQuantityChange = (delta: number) => {
        if (selectedProduct) {
            const hasSizes = selectedProduct.sizes && typeof selectedProduct.sizes === 'object' && Object.keys(selectedProduct.sizes).length > 0;
            if (hasSizes && selectedSize) {
                const available = getAvailableQuantity(selectedProduct, selectedSize);
                setQuantity(prev => Math.max(1, Math.min(available, prev + delta)));
            } else {
                setQuantity(prev => Math.max(1, prev + delta));
            }
        } else {
            setQuantity(prev => Math.max(1, prev + delta));
        }
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

    // Sort products based on selected option
    useEffect(() => {
        if (products.length === 0) {
            setFilteredProducts([]);
            return;
        }

        const sorted = [...products];
        
        switch (sortBy) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                // Assuming newer products might have higher IDs or you can add a date field
                sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default: // 'featured'
                // Keep original order or prioritize featured items
                break;
        }
        
        setFilteredProducts(sorted);
    }, [products, sortBy]);

    const displayProducts = filteredProducts.length > 0 ? filteredProducts : [];

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">

            {/* Enhanced Custom CSS with Animations */}
            <style>{`
        /* Fonts are already imported globally in index.css */
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        /* Enhanced Animations */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
          50% { box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-fade-in-up { 
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-down { 
          animation: fade-in-down 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-up { 
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-gentle-float { 
          animation: gentle-float 4s ease-in-out infinite; 
        }
        .animate-pulse-glow { 
          animation: pulse-glow 3s ease-in-out infinite; 
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.4s ease-out forwards;
          opacity: 0;
        }
        
        /* Stagger Animation for Product Grid */
        .product-card {
          animation: fade-in-scale 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .product-card:nth-child(1) { animation-delay: 0.05s; }
        .product-card:nth-child(2) { animation-delay: 0.1s; }
        .product-card:nth-child(3) { animation-delay: 0.15s; }
        .product-card:nth-child(4) { animation-delay: 0.2s; }
        .product-card:nth-child(5) { animation-delay: 0.25s; }
        .product-card:nth-child(6) { animation-delay: 0.3s; }
        .product-card:nth-child(7) { animation-delay: 0.35s; }
        .product-card:nth-child(8) { animation-delay: 0.4s; }
        .product-card:nth-child(9) { animation-delay: 0.45s; }
        .product-card:nth-child(10) { animation-delay: 0.5s; }
        .product-card:nth-child(n+11) { animation-delay: 0.55s; }
        
        /* Smooth Hover Effects */
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        
        .hover-scale {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .hover-glow {
          transition: box-shadow 0.3s ease;
        }
        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Glass Effect */
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Shimmer Loading Effect */
        .shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 0px,
            #e0e0e0 40px,
            #f0f0f0 80px
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        
        /* Smooth Transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Category Card Hover */
        .category-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card:hover {
          transform: translateY(-8px) scale(1.02);
        }
        
        /* Product Image Hover */
        .product-image-wrapper {
          overflow: hidden;
          position: relative;
        }
        .product-image-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .product-image-wrapper:hover::after {
          opacity: 1;
        }
      `}</style>

            {/* Enhanced Loading Screen with Animations - Show until products are loaded */}
            {(isLoading || isLoadingProducts) && (
                <div className="fixed inset-0 bg-white flex items-center justify-center z-50 animate-fade-in">
                    <div className="text-center space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-black text-2xl sm:text-3xl font-serif font-medium tracking-widest animate-fade-in-up">
                                Luxury Fashion
                            </div>
                            <div className="text-gray-600 text-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                {isLoadingProducts ? 'Loading products...' : 'Loading your style...'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Preview Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white max-w-4xl w-full max-h-[95vh] sm:max-h-screen overflow-y-auto rounded-lg sm:rounded-none">
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
                                        src={selectedProduct.images?.[currentImageIndex] || selectedProduct.image || '/placeholder.jpg'}
                                        alt={selectedProduct.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                        }}
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
                                                    src={image || '/placeholder.jpg'}
                                                    alt={`${selectedProduct.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="p-4 sm:p-6 lg:p-8">
                                <div className="mb-4 sm:mb-6">
                                    {selectedProduct.brand && (
                                        <p className="text-gray-500 text-xs sm:text-sm font-medium tracking-wide uppercase mb-2">
                                            {selectedProduct.brand}
                                        </p>
                                    )}
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-medium text-black mb-3 sm:mb-4">
                                        {selectedProduct.name}
                                    </h2>
                                    
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            <span className="text-xl sm:text-2xl font-serif font-medium text-black">
                                                ${selectedProduct.price}
                                            </span>
                                            {selectedProduct.originalPrice && (
                                                <span className="text-gray-400 line-through text-base sm:text-lg">
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
                                
                                {/* Size Selection - Always Show */}
                                <div className="mb-6">
                                    <SizeSelector
                                        product={selectedProduct}
                                        selectedSize={selectedSize}
                                        onSizeSelect={(size) => {
                                            try {
                                                setSelectedSize(size);
                                                // Update quantity to not exceed available quantity for selected size
                                                if (selectedProduct) {
                                                    const available = getAvailableQuantity(selectedProduct, size);
                                                    if (quantity > available) {
                                                        setQuantity(Math.max(1, available));
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Error selecting size:', error);
                                                setSelectedSize(size); // Still set the size even if quantity check fails
                                            }
                                        }}
                                        quantity={quantity}
                                    />
                                </div>
                                
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
                                <div className="space-y-3 sm:space-y-4">
                                    {(() => {
                                        const hasSizes = selectedProduct.sizes && typeof selectedProduct.sizes === 'object' && Object.keys(selectedProduct.sizes).length > 0;
                                        
                                        // Check stock availability
                                        let isInStock = false;
                                        if (hasSizes) {
                                          // For products with sizes, check if selected size has stock
                                          if (selectedSize) {
                                            isInStock = getAvailableQuantity(selectedProduct, selectedSize) > 0;
                                          }
                                        } else {
                                          // For products without sizes, check prod_quantity
                                          isInStock = (selectedProduct.quantity || 0) > 0;
                                        }
                                        
                                        // Button is disabled if no size selected OR out of stock
                                        const isDisabled = !selectedSize || !isInStock;
                                        
                                        return (
                                            <button 
                                                onClick={() => handleAddToCart(selectedProduct, quantity, selectedSize || undefined)}
                                                disabled={isDisabled}
                                                className={`w-full py-3 sm:py-4 font-medium text-xs sm:text-sm tracking-wide transition-colors duration-300 uppercase touch-manipulation ${
                                                    isDisabled
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-black text-white hover:bg-gray-800'
                                                }`}
                                            >
                                                {!selectedSize 
                                                  ? 'Please Select a Size' 
                                                  : !isInStock 
                                                    ? 'Out of Stock' 
                                                    : `Add to Cart - ₹${(selectedProduct.price * quantity).toLocaleString()}`
                                                }
                                            </button>
                                        );
                                    })()}
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

  {/* Don't render main content until products are loaded */}
  {!isLoading && !isLoadingProducts && (
    <main className="pt-0">
  {/* Hero Carousel - Limeroad Style (Mobile Responsive) with Animations */}
  <section
    ref={heroRef}
    className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] flex items-center overflow-hidden bg-gray-100 animate-fade-in-up"
  >
    <div className="absolute inset-0">
      {galleryImages.length > 0 && galleryImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={image}
            alt={`Banner ${index + 1}`}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-black/30 sm:bg-black/20"></div>
        </div>
      ))}
    </div>

    <div className="container mx-auto px-4 sm:px-6 relative z-20">
      <div className="max-w-xl sm:max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-4 sm:mb-5 animate-slide-in-left drop-shadow-2xl">
          {isAuthenticated && user ? (
            <>Welcome back, {user.firstName}!</>
          ) : (
            <>Discover Luxury Fashion</>
          )}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8 animate-slide-in-left drop-shadow-lg font-light max-w-2xl" style={{ animationDelay: '0.1s' }}>
          {isAuthenticated && user ? (
            <>Explore our exclusive collection curated just for you</>
          ) : (
            <>Elevate your style with premium fashion pieces. Shop the latest trends and timeless classics.</>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => {
              const productsSection = document.querySelector('[data-products-section]');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white px-8 sm:px-10 py-3 sm:py-3.5 font-bold text-sm sm:text-base rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>Shop Now</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </button>
          {!isAuthenticated && (
            <button 
              onClick={() => navigate('/register')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/50 hover:border-white px-8 sm:px-10 py-3 sm:py-3.5 font-bold text-sm sm:text-base rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Join Now
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Carousel Controls - Mobile Responsive with Animations */}
    {galleryImages.length > 1 && (
      <>
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all duration-300 z-20 touch-manipulation transform hover:scale-110 active:scale-95 hover:shadow-2xl animate-fade-in-scale"
          aria-label="Previous slide"
          style={{ animationDelay: '0.3s' }}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all duration-300 z-20 touch-manipulation transform hover:scale-110 active:scale-95 hover:shadow-2xl animate-fade-in-scale"
          aria-label="Next slide"
          style={{ animationDelay: '0.3s' }}
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-6 sm:w-8 h-0.5 sm:h-1 transition-all duration-300 rounded transform hover:scale-125 ${
                index === currentSlide
                  ? "bg-white shadow-lg scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </>
    )}
  </section>



                {/* Categories Section - Limeroad Style (Mobile Responsive) with Animations */}
                <section className="py-8 sm:py-12 md:py-16 bg-white">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-6 sm:mb-8 md:mb-12 animate-fade-in-up">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2 sm:mb-3">
                                Shop by Category
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Explore our carefully curated collections
                            </p>
                        </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
      className="group relative overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 block category-card hover-lift animate-fade-in-scale"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative overflow-hidden aspect-square sm:aspect-[4/5] product-image-wrapper">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300"></div>

        <div className="absolute inset-0 flex items-end p-3 sm:p-4 md:p-6">
          <div className="w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
              {category.name}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 font-medium mb-2 sm:mb-3 drop-shadow">
              {category.count}
            </p>
            <button className="w-full sm:w-auto bg-white text-black px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg opacity-0 group-hover:opacity-100">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  ))}
</div>
                    </div>
                </section>

                {/* Products Grid - Limeroad Style (Mobile Responsive) with Animations */}
                <section data-products-section className="py-6 sm:py-8 md:py-12 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6">
                        {/* Header with Sort - Mobile Responsive */}
                        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm hover-glow animate-fade-in-up">
                            <div>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-1">
                                    All Products
                                </h2>
                                {isLoadingProducts ? (
                                    <p className="text-gray-500 text-xs sm:text-sm animate-pulse">Loading products...</p>
                                ) : displayProducts.length > 0 ? (
                                    <p className="text-gray-600 text-xs sm:text-sm">
                                        {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'} available
                                    </p>
                                ) : null}
                            </div>
                            {/* Sort Dropdown - Mobile Responsive */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black w-full sm:w-auto"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Customer Rating</option>
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="name-asc">Name: A to Z</option>
                                    <option value="name-desc">Name: Z to A</option>
                                </select>
                            </div>
                        </div>

                        {/* Responsive Product Grid: 2 cols mobile, 3 tablet, 4 desktop, 5 large */}
                        {isLoadingProducts ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                                        <div className="aspect-square bg-gray-200 rounded mb-2 shimmer"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1 shimmer"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 shimmer"></div>
                                    </div>
                                ))}
                            </div>
                        ) : displayProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                                {displayProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="product-card group bg-white rounded-lg border border-gray-200 hover:border-gray-400 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer hover-lift"
                                        onClick={() => openProductPreview(product)}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        {/* Product Image Container - Limeroad Style with Animations */}
                                        <div className="relative aspect-square overflow-hidden bg-gray-50 product-image-wrapper">
                                            <img
                                                src={product.image || (product.images && product.images.length > 0 ? product.images[0] : null) || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-110 transition-transform duration-500 ease-out"
                                                loading="lazy"
                                            />
                                            
                                            {/* Product Badge with Animation */}
                                            {product.badge && (
                                                <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-red-600 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold rounded shadow-lg animate-bounce-in">
                                                    {product.badge}
                                                </div>
                                            )}

                                            {/* Wishlist Button with Animation */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(product.id);
                                                }}
                                                className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-white/95 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 transition-all duration-300 z-10 shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                                            >
                                                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                                            </button>
                                            
                                            {/* Quick View Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <span className="text-white text-xs font-semibold bg-black/70 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    Quick View
                                                </span>
                                            </div>
                                        </div>

                                        {/* Product Details - Limeroad Style Compact with Animations */}
                                        <div className="p-2 sm:p-3 space-y-1 transform group-hover:translate-y-0 transition-transform duration-300">
                                            {product.brand && (
                                                <p className="text-[9px] sm:text-[10px] text-gray-500 line-clamp-1 group-hover:text-gray-600 transition-colors">
                                                    {product.brand}
                                                </p>
                                            )}
                                            <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-black transition-colors duration-300">
                                                {product.name}
                                            </h3>
                                            
                                            {/* Rating - Mobile Responsive with Animation */}
                                            {product.rating && (
                                                <div className="flex items-center gap-1 transform group-hover:scale-105 transition-transform duration-300">
                                                    <div className="flex items-center">
                                                        <span className="text-[10px] sm:text-xs text-amber-500 animate-pulse">★</span>
                                                        <span className="text-[10px] sm:text-xs text-gray-600 ml-0.5">{product.rating.toFixed(1)}</span>
                                                    </div>
                                                    <span className="text-[9px] sm:text-[10px] text-gray-500">({product.reviewCount || 0})</span>
                                                </div>
                                            )}
                                            
                                            {/* Price - Mobile Responsive with Animation */}
                                            <div className="flex items-baseline gap-1 flex-wrap">
                                                <span className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-black transition-colors">
                                                    ₹{product.price.toFixed(0)}
                                                </span>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <>
                                                        <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                                                            ₹{product.originalPrice.toFixed(0)}
                                                        </span>
                                                        <span className="text-[9px] sm:text-[10px] text-green-600 font-medium animate-pulse">
                                                            ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            
                                           
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No products available at the moment.</p>
                            </div>
                        )}
                    </div>
                </section>
    </main>
  )}

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Floating Cart Button with Preview */}
            <div className="fixed bottom-8 right-8 z-30">
              <div className="relative">
                <button 
                  onClick={() => {
                    if (isAuthenticated && !cart) {
                      refreshCart();
                    }
                    navigate('/cart');
                  }}
                  onMouseEnter={() => {
                    if (isAuthenticated && !cart) {
                      refreshCart();
                    }
                    setShowFloatingCart(true);
                  }}
                  className="w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300 animate-luxury-glow"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
                
                {/* Floating Cart Preview */}
                {showFloatingCart && cart && cart.items && cart.items.length > 0 && (
                  <div 
                    className="absolute bottom-16 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-xl"
                    onMouseEnter={() => setShowFloatingCart(true)}
                    onMouseLeave={() => setShowFloatingCart(false)}
                  >
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="font-semibold text-sm">Cart ({cartCount} items)</h3>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto">
                      {cart.items.slice(0, 2).map((item) => (
                        <div key={item.cartItemId || item.id} className="p-3 border-b border-gray-50">
                          <div className="flex gap-2">
                            <img
                              src={item.product.imagenames[0] || '/placeholder.jpg'}
                              alt={item.product.prod_name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs truncate">{item.product.prod_name}</h4>
                              <p className="text-xs text-gray-600">{item.product.prod_brand}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-semibold">₹{item.product.selling_price}</span>
                                <span className="text-xs text-gray-500">×{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {cart.items.length > 2 && (
                      <div className="p-2 text-center text-xs text-gray-600 border-b border-gray-100">
                        +{cart.items.length - 2} more items
                      </div>
                    )}
                    
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm">Total: ₹{(cart.totalAmount || cart.totalPrice || 0).toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-black text-white py-2 px-3 rounded text-xs hover:bg-gray-800 transition"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
    );
};

export default FashionHomepage;