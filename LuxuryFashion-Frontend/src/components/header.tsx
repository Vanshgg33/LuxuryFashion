import React, { useState, useEffect, useRef } from "react";
import { Search, User, Menu, X, ShoppingBag, Heart, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  cartCount?: number;
  isLoggedIn?: boolean;
}

const Header: React.FC<HeaderProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const categoryRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (category: string) => {
    const categoryPath = category.toLowerCase().replace(/\s+/g, "-");
    navigate(`/category/${categoryPath}`);
    setMobileMenuOpen(false);
    setActiveCategory(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      navigate(`/search/${encodedQuery}`);
      setSearchQuery("");
    }
  };

  const menuItems = [
    { name: "Women", subcategories: ["Dresses", "Tops", "Bottoms", "Outerwear", "Footwear"] },
    { name: "Men", subcategories: ["Shirts", "Pants", "Jackets", "Shoes", "Accessories"] },
    { name: "Accessories", subcategories: ["Bags", "Jewelry", "Watches", "Belts", "Sunglasses"] },
    { name: "Sale", subcategories: [] }
  ];

  return (
    <>
      {/* Promotional Banner */}
      {showPromoBanner && (
        <div className="fixed top-0 left-0 right-0 bg-black text-white text-center py-2 text-xs sm:text-sm z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <span className="flex-1">🎉 Free Shipping on Orders Over ₹5000</span>
            <button
              onClick={() => setShowPromoBanner(false)}
              className="ml-4 hover:text-gray-300 transition-colors"
              aria-label="Close banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <header className={`fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-200 transition-all duration-300 ${showPromoBanner ? 'mt-8' : ''}`}>
        {/* Top Bar - Logo, Search, Icons */}
        <nav className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Logo - Left */}
              <div
                className="text-xl sm:text-2xl font-serif font-medium text-black tracking-widest hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
                onClick={() => navigate("/")}
              >
                LuxuryFashion
              </div>

              {/* Search Bar - Center (Limeroad Style) */}
              <div className="flex-1 max-w-2xl mx-4 hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands and more..."
                    className="w-full px-4 py-2.5 pl-10 pr-12 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Icons - Right */}
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                {/* Mobile Search */}
                <button
                  aria-label="Search"
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 text-gray-700 hover:text-black transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* User Account */}
                <div className="relative hidden sm:block">
                  <button
                    aria-label="User Menu"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 text-gray-700 hover:text-black transition-colors flex items-center gap-1"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm">{isAuthenticated ? user?.firstName || 'Account' : 'Account'}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-black">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                          </div>
                          <button
                            onClick={() => { navigate('/orders'); setUserMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            My Orders
                          </button>
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Admin Panel
                            </button>
                          )}
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { navigate('/login'); setUserMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                          >
                            Login
                          </button>
                          <button
                            onClick={() => { navigate('/register'); setUserMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Register
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  aria-label="Wishlist"
                  onClick={() => navigate('/wishlist')}
                  className="p-2 text-gray-700 hover:text-black transition-colors relative hidden sm:block"
                >
                  <Heart className="w-5 h-5" />
                </button>

                {/* Cart */}
                <button
                  aria-label="Cart"
                  onClick={() => navigate('/cart')}
                  className="relative p-2 text-gray-700 hover:text-black transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full min-w-[18px] h-4 flex items-center justify-center px-1">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>

                {/* Mobile Menu Button */}
                <button
                  className="lg:hidden p-2 text-gray-700 hover:text-black transition-colors"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Category Menu Bar - Below (Limeroad Style) */}
        <nav ref={categoryRef} className="bg-white border-b border-gray-100 hidden lg:block">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 py-2">
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.subcategories.length > 0 && setActiveCategory(item.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <button
                    onClick={() => handleCategoryClick(item.name)}
                    className="flex items-center gap-1 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    {item.name}
                    {item.subcategories.length > 0 && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeCategory === item.name ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {/* Mega Menu Dropdown */}
                  {activeCategory === item.name && item.subcategories.length > 0 && (
                    <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-4 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-semibold text-black text-sm">{item.name}</h3>
                      </div>
                      <div className="py-2">
                        {item.subcategories.map((subcat) => (
                          <button
                            key={subcat}
                            onClick={() => {
                              handleCategoryClick(`${item.name} ${subcat}`);
                              setActiveCategory(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                          >
                            {subcat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 lg:hidden flex flex-col overflow-y-auto">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div
                className="text-lg font-serif font-medium text-black tracking-widest cursor-pointer"
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
              >
                LuxuryFashion
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-700 hover:text-black transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-100">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>

            {/* Mobile Menu Items */}
            <div className="flex flex-col p-4 space-y-2">
              {menuItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => {
                      if (item.subcategories.length === 0) {
                        handleCategoryClick(item.name);
                      } else {
                        setActiveCategory(activeCategory === item.name ? null : item.name);
                      }
                    }}
                    className="w-full flex items-center justify-between py-3 text-base font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    {item.name}
                    {item.subcategories.length > 0 && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeCategory === item.name ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {activeCategory === item.name && item.subcategories.length > 0 && (
                    <div className="pl-4 space-y-1">
                      {item.subcategories.map((subcat) => (
                        <button
                          key={subcat}
                          onClick={() => handleCategoryClick(`${item.name} ${subcat}`)}
                          className="w-full text-left py-2 text-sm text-gray-600 hover:text-black transition-colors"
                        >
                          {subcat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile User Actions */}
            <div className="border-t border-gray-200 p-4 space-y-2 mt-auto">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}
                    className="w-full text-center py-3 text-base font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    My Orders
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                      className="w-full text-center py-3 text-base font-medium text-gray-700 hover:text-black transition-colors"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                    className="w-full text-center py-3 text-base font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 text-base font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                    className="w-full border-2 border-black text-black py-3 rounded-lg hover:bg-gray-50 text-base font-medium transition-colors"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
