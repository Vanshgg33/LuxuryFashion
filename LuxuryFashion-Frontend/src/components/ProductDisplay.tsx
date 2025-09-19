import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Heart, Eye, Star, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { BackendProduct } from "../api/base";
import { fetchProductsall } from "../api/ProductApi";
import Fuse from "fuse.js";



const ProductDisplayPage: React.FC = () => {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<BackendProduct | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wishlist, ] = useState<number[]>([]);
  
  const location = useLocation();
  const params = useParams();
  const [allProducts, setAllProducts] = useState<BackendProduct[]>([]);


  const categoryFromPath = params.category;
  const queryParams = new URLSearchParams(location.search);
  const categoryFromQuery = queryParams.get("category");
  const search = queryParams.get("search") || undefined;
  
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
  const searchWords = searchLower ? searchLower.split(/\s+/) : [];

  // --- Setup Fuse.js for multi-word search ---
  const fuse = new Fuse(allProducts, {
    keys: ["prod_name", "prod_brand", "prod_category", "prod_gender", "prod_tag"],
    threshold: 0.4, // fuzzy level
    distance: 100,
    ignoreLocation: true,
  });

  let filtered: BackendProduct[] = allProducts;

  // --- Apply main search ---
  if (searchWords.length > 0) {
    // Each word must match
    searchWords.forEach((word) => {
      const fuseResults = fuse.search(word);
      const matchedItems = new Set(fuseResults.map((r) => r.item));
      filtered = filtered.filter((p) => matchedItems.has(p));
    });
  }

  // --- Apply category refinement ---
  if (categoryLower) {
    filtered = filtered.filter((p) => {

      const gender = p.prod_gender?.toLowerCase();

      if (["men", "mens", "male"].includes(categoryLower)) {
        return gender === "male" || gender === "men";
      } else if (["women", "womens", "female"].includes(categoryLower)) {
        return gender === "female" || gender === "women";
      } else {
        // fallback: fuzzy match category keyword
        const fuseCat = new Fuse([p], {
          keys: ["prod_name", "prod_category", "prod_gender", "prod_tag"],
          threshold: 0.4,
          distance: 100,
          ignoreLocation: true,
        });
        return fuseCat.search(categoryLower).length > 0;
      }
    });
  }

  setProducts(filtered);
}, [category, search, allProducts]);







  const openProductPreview = (product: BackendProduct) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeProductPreview = () => {
    setSelectedProduct(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (selectedProduct?.prod_images && selectedProduct.prod_images.length > 1) {
      setCurrentImageIndex(prev => 
        (prev + 1) % selectedProduct.prod_images.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct?.prod_images && selectedProduct.prod_images.length > 1) {
      setCurrentImageIndex(prev => 
        (prev - 1 + selectedProduct.prod_images.length) % selectedProduct.prod_images.length
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
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white font-sans">
        {/* Product Preview Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-6xl w-full max-h-screen overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Product Images */}
                <div className="relative">
                  <button
                    onClick={closeProductPreview}
                    className="absolute top-6 right-6 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={selectedProduct.prod_images?.[currentImageIndex] || selectedProduct.prod_images?.[0] || "https://via.placeholder.com/600"}
                      alt={selectedProduct.prod_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image Navigation */}
                  {selectedProduct.prod_images && selectedProduct.prod_images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {/* Thumbnail Strip */}
                      <div className="flex space-x-2 p-6 overflow-x-auto">
                        {selectedProduct.prod_images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all duration-300 bg-gray-50 flex items-center justify-center ${
                              currentImageIndex === index ? 'border-black shadow-lg' : 'border-gray-200 hover:border-gray-300'
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
                <div className="p-8 lg:p-12">
                  <div className="mb-8">
                    <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-3">
                      {selectedProduct.prod_brand}
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-serif font-medium text-black mb-6 leading-tight">
                      {selectedProduct.prod_name}
                    </h2>
                    
                    {renderRating(selectedProduct.rating, selectedProduct.reviewCount)}
                    
                    <div className="mb-6">
                      {formatPrice(selectedProduct.prod_price, selectedProduct.selling_price)}
                    </div>

                    {(selectedProduct.Badge || selectedProduct.Badge) && (
                      <div className="mb-6">
                        <span className={`inline-block px-4 py-2 text-sm font-medium tracking-wide ${getBadgeStyles(selectedProduct.Badge || selectedProduct.Badge)} uppercase`}>
                          {selectedProduct.Badge || selectedProduct.Badge}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {selectedProduct.prod_description && (
                    <div className="mb-8">
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {selectedProduct.prod_description}
                      </p>
                    </div>
                  )}
                  
                  {/* Stock Status */}
                  <div className="mb-8">
                    <span className={`text-sm font-medium uppercase tracking-wide ${
                      selectedProduct.prod_quantity > 0 
                        ? selectedProduct.prod_quantity > 5 
                          ? 'text-emerald-600' 
                          : 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {selectedProduct.prod_quantity > 0 
                        ? selectedProduct.prod_quantity > 5 
                          ? 'In Stock' 
                          : `Only ${selectedProduct.prod_quantity} left`
                        : 'Out of Stock'
                      }
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <button 
                      className={`w-full py-4 font-medium text-sm tracking-wide transition-all duration-300 uppercase ${
                        selectedProduct.prod_quantity > 0
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={selectedProduct.prod_quantity === 0}
                    >
                      {selectedProduct.prod_quantity > 0 ? 'Add to Cart' : 'Notify When Available'}
                    </button>
                    <button
                      onClick={() => toggleWishlist(selectedProduct.prod_id)}
                      className={`w-full border-2 py-4 font-medium text-sm tracking-wide transition-all duration-300 uppercase flex items-center justify-center space-x-2 ${
                        wishlist.includes(selectedProduct.prod_id)
                          ? 'border-red-500 text-red-500'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(selectedProduct.prod_id) ? 'fill-current' : ''}`} />
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
                          src={product.prod_images?.[0] || "https://via.placeholder.com/400"}
                          alt={product.prod_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        
                        {/* Badge */}
                        {(product.Badge || product.Badge) && (
                          <div className="absolute top-4 left-4">
                            <span className={`inline-block px-3 py-1 text-xs font-medium tracking-wide ${getBadgeStyles(product.Badge || product.prodStatus)} uppercase`}>
                              {product.Badge || product.Badge}
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
                            <button className="border-2 border-white text-white px-6 py-3 font-medium text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300 uppercase transform scale-95 group-hover:scale-100">
                              Add to Cart
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
                          <span className={`font-medium ${product.prod_quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {product.prod_quantity > 0 
                              ? product.prod_quantity > 5 
                                ? 'In Stock' 
                                : `Only ${product.prod_quantity} left`
                              : 'Out of Stock'
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
                          className={`w-full py-3 font-medium text-sm tracking-wide transition-all duration-300 uppercase ${
                            product.prod_quantity > 0
                              ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={product.prod_quantity === 0}
                        >
                          {product.prod_quantity > 0 ? 'Add to Cart' : 'Notify When Available'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Floating Cart Button */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300 z-30">
          <ShoppingBag className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export default ProductDisplayPage;


