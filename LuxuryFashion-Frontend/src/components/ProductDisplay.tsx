import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Heart, Eye, Star, ShoppingBag, X, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import type { BackendProduct } from "../api/base";
import { fetchProductsall } from "../api/ProductApi";
import Fuse from "fuse.js";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import { SizeSelector, getAvailableQuantity, isSizeAvailable } from './SizeSelector';



const ProductDisplayPage: React.FC = () => {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<BackendProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wishlist, ] = useState<number[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const { addToCart, cart, cartCount, refreshCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const location = useLocation();
  const params = useParams();
  const [allProducts, setAllProducts] = useState<BackendProduct[]>([]);


  const categoryFromPath = params.category;
  const queryFromPath = params.query; // Get query from /search/:query route
  const queryParams = new URLSearchParams(location.search);
  const categoryFromQuery = queryParams.get("category");
  const searchFromQuery = queryParams.get("search");
  
  // Use search from path param (from /search/:query) or query param (from ?search=)
  const search = queryFromPath ? decodeURIComponent(queryFromPath) : (searchFromQuery || undefined);
  const category = categoryFromPath || categoryFromQuery || undefined;

useEffect(() => {
  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchProductsall(); 
      setAllProducts(data);
      setProducts(data); 
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(
        `Failed to fetch products: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchAllProducts();
}, []);



useEffect(() => {
  if (!allProducts.length) {
    setProducts([]);
    return;
  }

  const searchLower = search?.toLowerCase().trim() || "";
  const categoryLower = category?.toLowerCase().trim() || "";

  // Split search into words for multi-word search
  const searchWords = searchLower ? searchLower.split(/\s+/).filter(w => w.length > 0) : [];

  // --- Setup Fuse.js for multi-word search ---
  const fuse = new Fuse(allProducts, {
    keys: [
      { name: "prod_name", weight: 0.5 },
      { name: "prod_brand", weight: 0.3 },
      { name: "prod_category", weight: 0.1 },
      { name: "prod_gender", weight: 0.05 },
      { name: "prod_tag", weight: 0.05 }
    ],
    threshold: 0.4, // fuzzy level (lower = more strict, higher = more fuzzy)
    distance: 100,
    ignoreLocation: true,
    includeScore: true,
  });

  let filtered: BackendProduct[] = allProducts;

  // --- Apply main search ---
  if (searchWords.length > 0) {
    // Use AND logic: all words must match (but can be in any order)
    const matchedProducts = new Map<BackendProduct, number>();
    
    searchWords.forEach((word) => {
      const fuseResults = fuse.search(word);
      fuseResults.forEach((result) => {
        const product = result.item;
        const score = result.score || 1;
        // Track best (lowest) score for each product
        if (!matchedProducts.has(product) || matchedProducts.get(product)! > score) {
          matchedProducts.set(product, score);
        }
      });
    });
    
    // Only include products that matched ALL search words
    filtered = allProducts.filter((p) => {
      // Check if this product matched all words
      return searchWords.every((word) => {
        const wordResults = fuse.search(word);
        return wordResults.some((r) => r.item === p);
      });
    });
    
    // Sort by relevance (products matching more words or with better scores come first)
    filtered.sort((a, b) => {
      const aScore = matchedProducts.get(a) || 1;
      const bScore = matchedProducts.get(b) || 1;
      return aScore - bScore; // Lower score = better match
    });
  }

  // --- Apply category refinement ---
  if (categoryLower && !searchLower) {
    // Only filter by category if there's no search query
    // (search already considers category in its matching)
    filtered = filtered.filter((p) => {
      const gender = p.prod_gender?.toLowerCase();
      const prodCategory = p.prod_category?.toLowerCase();

      if (["men", "mens", "male"].includes(categoryLower)) {
        return gender === "male" || gender === "men";
      } else if (["women", "womens", "female"].includes(categoryLower)) {
        return gender === "female" || gender === "women";
      } else {
        // Match category name or use fuzzy search
        return prodCategory?.includes(categoryLower) || 
               p.prod_name?.toLowerCase().includes(categoryLower) ||
               p.prod_tag?.toLowerCase().includes(categoryLower);
      }
    });
  }

  setProducts(filtered);
}, [category, search, allProducts]);







  const openProductPreview = (product: BackendProduct) => {
    setSelectedProduct(product);
    // Initialize size selection
    const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
    if (hasSizes) {
      const firstSize = product.sizes ? Object.keys(product.sizes).find(size => product.sizes![size] > 0) || null : null;
      setSelectedSize(firstSize);
      // Always start with quantity 1, not from backend
      setQuantity(1);
    } else {
      // Auto-select "One Size" for products without defined sizes
      setSelectedSize('One Size');
      // Always start with quantity 1, not from backend
      setQuantity(1);
    }
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeProductPreview = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (selectedProduct?.imagenames && selectedProduct.imagenames.length > 1) {
      setCurrentImageIndex(prev => 
        (prev + 1) % selectedProduct.imagenames.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct?.imagenames && selectedProduct.imagenames.length > 1) {
      setCurrentImageIndex(prev => 
        (prev - 1 + selectedProduct.imagenames.length) % selectedProduct.imagenames.length
      );
    }
  };

  const getBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'new arrival':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
      case 'sale':
      case 'on sale':
        return 'bg-gradient-to-r from-rose-500 to-pink-500 text-white';
      case 'trending':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      case 'limited':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      default:
        return 'bg-black text-white';
    }
  };

  const renderRating = (rating?: number, reviewCount?: number) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < fullStars 
                  ? 'fill-amber-400 text-amber-400' 
                  : i === fullStars && hasHalfStar 
                    ? 'fill-amber-400 text-amber-400 opacity-50' 
                    : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-gray-600 text-sm">({rating.toFixed(1)})</span>
        {reviewCount && (
          <span className="text-gray-500 text-sm">{reviewCount} reviews</span>
        )}
      </div>
    );
  };

  const formatPrice = (price: number, sellingPrice?: number) => {
    if (sellingPrice && sellingPrice < price) {
      const discount = Math.round(((price - sellingPrice) / price) * 100);
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-serif font-medium text-black">₹{sellingPrice}</span>
            <span className="text-gray-400 line-through text-lg">₹{price}</span>
          </div>
          <span className="text-emerald-600 text-sm font-medium">{discount}% OFF</span>
        </div>
      );
    }
    return <span className="text-2xl font-serif font-medium text-black">₹{price}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-8"></div>
          <div className="text-black text-2xl font-serif font-medium tracking-widest">
            Loading Collection...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <X className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-2xl font-serif font-medium text-black mb-4">Something Went Wrong</h3>
          <p className="text-red-600 mb-6 leading-relaxed">{error}</p>
          <p className="text-gray-500">Please try again or select a different category.</p>
        </div>
      </div>
    );
  }

  function toggleWishlist(_prod_id: number): void {
    // Wishlist functionality can be implemented later
    setToast({ message: 'Wishlist feature coming soon!', type: 'warning' });
  }

  const handleAddToCart = async (product: BackendProduct, qty: number = 1, size?: string) => {
    if (!isAuthenticated) {
      setToast({ message: 'Please login to add items to cart', type: 'warning' });
      return;
    }

    // Check if product has sizes and size is required
    const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
    
    // Check if product is out of stock (for products without sizes)
    if (!hasSizes && product.prod_quantity <= 0) {
      setToast({ message: 'This product is out of stock', type: 'error' });
      return;
    }
    
    // For products with sizes, check if all sizes are out of stock
    if (hasSizes) {
      const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0) : 0;
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
      await addToCart(product.prod_id, qty, product.selling_price, size);
      setToast({ message: 'Item added to cart!', type: 'success' });
      if (selectedProduct) {
        closeProductPreview();
      }
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      setToast({ 
        message: error.message || 'Failed to add item to cart', 
        type: 'error' 
      });
    }
  };

  return (
    <>
      <style>{`
        /* Fonts are already imported globally in index.css */
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-gray-900 font-sans transition-colors duration-200">
        {/* Product Preview Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-85 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white dark:bg-gray-800 max-w-6xl w-full min-h-screen sm:min-h-0 max-h-screen overflow-y-auto scale-in">
              {/* Close Button - Sticky on Mobile */}
              <button
                onClick={closeProductPreview}
                className="fixed sm:absolute top-4 right-4 z-20 p-3 sm:p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Product Images */}
                <div className="relative">
                  <div className="aspect-[3/4] sm:aspect-square max-h-[60vh] sm:max-h-none overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <img
                      src={selectedProduct.imagenames?.[currentImageIndex] || selectedProduct.imagenames?.[0] || "/placeholder.jpg"}
                      alt={selectedProduct.prod_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Image Navigation */}
                  {selectedProduct.imagenames && selectedProduct.imagenames.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 touch-manipulation z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 touch-manipulation z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      
                      {/* Thumbnail Strip */}
                      <div className="flex space-x-2 sm:space-x-3 p-3 sm:p-4 lg:p-6 overflow-x-auto bg-gray-50 dark:bg-gray-900">
                        {selectedProduct.imagenames.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 transition-all duration-300 bg-gray-50 dark:bg-gray-800 flex items-center justify-center rounded touch-manipulation ${
                              currentImageIndex === index 
                                ? 'border-black dark:border-white shadow-lg scale-105' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${selectedProduct.prod_name} ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
                  <div className="mb-6 sm:mb-8">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium tracking-wide uppercase mb-2 sm:mb-3">
                      {selectedProduct.prod_brand}
                    </p>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-serif font-medium text-black dark:text-white mb-4 sm:mb-6 leading-tight">
                      {selectedProduct.prod_name}
                    </h2>
                    
                    {renderRating(selectedProduct.rating, selectedProduct.reviewCount)}
                    
                    <div className="mb-4 sm:mb-6">
                      {formatPrice(selectedProduct.prod_price, selectedProduct.selling_price)}
                    </div>

                    {selectedProduct.Badge && (
                      <div className="mb-4 sm:mb-6">
                        <span className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium tracking-wide ${getBadgeStyles(selectedProduct.Badge)} uppercase`}>
                          {selectedProduct.Badge}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {selectedProduct.prod_description && (
                    <div className="mb-6 sm:mb-8">
                      <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {selectedProduct.prod_description}
                      </p>
                    </div>
                  )}
                  
                  {/* Size Selection - Always Show */}
                  <div className="mb-6 sm:mb-8">
                    <SizeSelector
                      product={selectedProduct}
                      selectedSize={selectedSize}
                      onSizeSelect={(size) => {
                        try {
                          setSelectedSize(size);
                          if (selectedProduct) {
                            const available = getAvailableQuantity(selectedProduct, size);
                            if (quantity > available) {
                              setQuantity(Math.max(1, available));
                            }
                          }
                        } catch (error) {
                          console.error('Error selecting size:', error);
                          setSelectedSize(size);
                        }
                      }}
                      quantity={quantity}
                    />
                  </div>

                  {/* Quantity Selector */}
                  {selectedProduct.sizes && typeof selectedProduct.sizes === 'object' && Object.keys(selectedProduct.sizes).length > 0 && selectedSize ? (
                    <div className="mb-6 sm:mb-8">
                      <label className="block text-sm sm:text-base font-medium text-black dark:text-white mb-2 sm:mb-3 uppercase tracking-wide">
                        Quantity
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => {
                            const available = getAvailableQuantity(selectedProduct, selectedSize);
                            setQuantity(prev => Math.max(1, Math.min(available, prev - 1)));
                          }}
                          disabled={quantity <= 1}
                          className="p-2.5 sm:p-2 border-2 border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <span className="text-base sm:text-lg font-medium min-w-8 text-center text-black dark:text-white px-2">
                          {quantity}
                        </span>
                        <button
                          onClick={() => {
                            const available = getAvailableQuantity(selectedProduct, selectedSize);
                            setQuantity(prev => Math.max(1, Math.min(available, prev + 1)));
                          }}
                          disabled={quantity >= getAvailableQuantity(selectedProduct, selectedSize)}
                          className="p-2.5 sm:p-2 border-2 border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-2">
                          (Max: {getAvailableQuantity(selectedProduct, selectedSize)})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 sm:mb-8">
                      <span className={`text-sm sm:text-base font-medium uppercase tracking-wide ${
                        selectedProduct.prod_quantity > 0 
                          ? selectedProduct.prod_quantity > 5 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {selectedProduct.prod_quantity > 0 
                          ? selectedProduct.prod_quantity > 5 
                            ? 'In Stock' 
                            : `Only ${selectedProduct.prod_quantity} left`
                          : 'Currently Unavailable'
                        }
                      </span>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="space-y-3 sm:space-y-4">
                    {(() => {
                      const hasSizes = selectedProduct.sizes && typeof selectedProduct.sizes === 'object' && Object.keys(selectedProduct.sizes).length > 0;
                      const isInStock = hasSizes 
                        ? (selectedSize && getAvailableQuantity(selectedProduct, selectedSize) > 0)
                        : selectedProduct.prod_quantity > 0;
                      const isDisabled = !isInStock || !selectedSize;
                      
                      return (
                        <button 
                          onClick={() => handleAddToCart(selectedProduct, quantity, selectedSize || undefined)}
                          className={`w-full py-3.5 sm:py-4 font-medium text-sm sm:text-base tracking-wide transition-all duration-300 uppercase touch-manipulation ${
                            isDisabled
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                          }`}
                          disabled={isDisabled}
                        >
                          {isDisabled 
                            ? (!selectedSize ? 'Please Select a Size' : 'Currently Unavailable')
                            : `Add to Cart - ₹${(selectedProduct.selling_price * quantity).toLocaleString()}`
                          }
                        </button>
                      );
                    })()}
                    <button
                      onClick={() => toggleWishlist(selectedProduct.prod_id)}
                      className={`w-full border-2 py-3.5 sm:py-4 font-medium text-sm sm:text-base tracking-wide transition-all duration-300 uppercase flex items-center justify-center space-x-2 touch-manipulation ${
                        wishlist.includes(selectedProduct.prod_id)
                          ? 'border-red-500 dark:border-red-400 text-red-500 dark:text-red-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlist.includes(selectedProduct.prod_id) ? 'fill-current' : ''}`} />
                      <span>{wishlist.includes(selectedProduct.prod_id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="pt-20">
          {/* Hero Header */}
          <section className="bg-white py-16">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-4xl md:text-6xl font-serif font-medium text-black mb-6 capitalize">
                {category
                  ? `${category.replace('-', ' ')} Collection`
                  : search
                  ? `Search Results`
                  : "All Products"}
              </h1>
              {search && (
                <p className="text-xl text-gray-600 font-light mb-6">
                  Showing results for "<span className="font-medium">{search}</span>"
                </p>
              )}
              <div className="w-24 h-0.5 bg-black mx-auto mb-8"></div>
              {products.length > 0 && (
                <p className="text-xl text-gray-600 font-light">
                  {products.length} exquisite pieces
                </p>
              )}
            </div>
          </section>

          {/* Empty State */}
          {!loading && products.length === 0 && !error && (
            <section className="py-24 bg-white">
              <div className="container mx-auto px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-serif font-medium text-black mb-4">No Products Found</h3>
                <p className="text-gray-600 font-light max-w-md mx-auto leading-relaxed">
                  {category || search 
                    ? "We couldn't find any products matching your criteria. Try browsing other categories or adjusting your search." 
                    : "No products available at the moment. Please check back later!"}
                </p>
              </div>
            </section>
          )}

          {/* Products Grid */}
          {products.length > 0 && (
            <section className="py-16 bg-white">
              <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <div
                      key={product.prod_id}
                      className="group bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl"
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden aspect-square bg-gray-50">
                        <img
                          src={product.imagenames?.[0] || "/placeholder.jpg"}
                          alt={product.prod_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        
                        {/* Badge */}
                        {product.Badge && (
                          <div className="absolute top-4 left-4">
                            <span className={`inline-block px-3 py-1 text-xs font-medium tracking-wide ${getBadgeStyles(product.Badge)} uppercase`}>
                              {product.Badge}
                            </span>
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product.prod_id)}
                          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                        >
                          <Heart className={`w-4 h-4 ${wishlist.includes(product.prod_id) ? 'fill-red-500 text-red-500' : ''}`} />
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
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
                                
                                // Check if product is out of stock
                                let isOutOfStock = false;
                                if (hasSizes) {
                                  // For products with sizes, check if all sizes are out of stock
                                  const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0) : 0;
                                  isOutOfStock = totalStock <= 0;
                                } else {
                                  // For products without sizes, check prod_quantity
                                  isOutOfStock = product.prod_quantity <= 0;
                                }
                                
                                if (isOutOfStock) {
                                  setToast({ message: 'This product is out of stock', type: 'error' });
                                  return;
                                }
                                
                                if (hasSizes) {
                                  openProductPreview(product);
                                } else {
                                  handleAddToCart(product);
                                }
                              }}
                              disabled={(() => {
                                const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
                                if (hasSizes) {
                                  const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0) : 0;
                                  return totalStock <= 0;
                                }
                                return product.prod_quantity <= 0;
                              })()}
                              className="border-2 border-white text-white px-6 py-3 font-medium text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300 uppercase transform scale-95 group-hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {(() => {
                                const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
                                if (hasSizes) {
                                  const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0) : 0;
                                  if (totalStock <= 0) return 'Currently Unavailable';
                                  return 'Select Size';
                                }
                                if (product.prod_quantity <= 0) return 'Currently Unavailable';
                                return 'Add to Cart';
                              })()}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Product Information */}
                      <div className="p-6 space-y-4">
                        {/* Brand & Category */}
                        <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide">
                          <span className="font-medium">{product.prod_brand}</span>
                          <span>{product.prod_category}</span>
                        </div>

                        {/* Product Name */}
                        <h3 className="font-serif font-medium text-lg text-black group-hover:text-gray-700 transition-colors duration-300 leading-tight">
                          {product.prod_name}
                        </h3>

                        {/* Rating */}
                        {renderRating(product.rating, product.reviewCount)}

                        {/* Price */}
                        <div>
                          {formatPrice(product.prod_price, product.selling_price)}
                        </div>

                        {/* Stock & Tag */}
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-medium ${product.prod_quantity > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {product.prod_quantity > 0 
                              ? product.prod_quantity > 5 
                                ? 'In Stock' 
                                : `Only ${product.prod_quantity} left`
                              : 'Currently Unavailable'
                            }
                          </span>
                          {product.prod_tag && (
                            <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {product.prod_tag}
                            </span>
                          )}
                        </div>

                        {/* Action Button */}
                        <button 
                          onClick={() => {
                            const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
                            
                            // Check if product is out of stock
                            let isOutOfStock = false;
                            if (hasSizes) {
                              // For products with sizes, check if all sizes are out of stock
                              const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0) : 0;
                              isOutOfStock = totalStock <= 0;
                            } else {
                              // For products without sizes, check prod_quantity
                              isOutOfStock = product.prod_quantity <= 0;
                            }
                            
                            if (isOutOfStock) {
                              setToast({ message: 'This product is out of stock', type: 'error' });
                              return;
                            }
                            
                            if (hasSizes) {
                              openProductPreview(product);
                            } else {
                              handleAddToCart(product);
                            }
                          }}
                          disabled={(() => {
                            const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
                            if (hasSizes) {
                              const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0) : 0;
                              return totalStock <= 0;
                            }
                            return product.prod_quantity <= 0;
                          })()}
                          className={`w-full py-3 font-medium text-sm tracking-wide transition-all duration-300 uppercase ${
                            (() => {
                              const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
                              if (hasSizes) {
                                const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0) : 0;
                                return totalStock > 0;
                              }
                              return product.prod_quantity > 0;
                            })()
                              ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {(() => {
                            const hasSizes = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0;
                            let isOutOfStock = false;
                            if (hasSizes) {
                              const totalStock = product.sizes ? Object.values(product.sizes).reduce((sum: number, qty: any) => sum + (qty || 0), 0) : 0;
                              isOutOfStock = totalStock <= 0;
                            } else {
                              isOutOfStock = product.prod_quantity <= 0;
                            }
                            
                            if (isOutOfStock) return 'Currently Unavailable';
                            return hasSizes ? 'Select Size' : 'Add to Cart';
                          })()}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

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
              className="w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300"
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
                          src={item.product.imagenames?.[0] || '/placeholder.jpg'}
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
    </>
  );
};

export default ProductDisplayPage;


