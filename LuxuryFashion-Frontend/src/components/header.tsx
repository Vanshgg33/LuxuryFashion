import React, { useState } from "react";
import { Search, User, Menu, X, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface HeaderProps {
  cartCount?: number;
  isLoggedIn?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    // Convert to URL-friendly format and navigate to category/[clicked-item]
    const categoryPath = category.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categoryPath}`);
    setMobileMenuOpen(false);
  };

  const menuItems = ["Women", "Men", "Accessories",  "Sale"];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-40 border-b border-gray-100 transition-all duration-300">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="text-xl sm:text-2xl md:text-3xl font-serif font-medium text-black tracking-widest hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => navigate("/")}
          >
            ÉLÉGANCE
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-8 xl:space-x-12">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => handleCategoryClick(item)}
                className="relative text-gray-700 hover:text-black transition-colors duration-300 font-medium text-sm xl:text-base tracking-wide group"
              >
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              aria-label="Search"
              className="p-2 text-gray-700 hover:text-black transition-colors duration-300"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              aria-label="User"
              className="p-2 text-gray-700 hover:text-black transition-colors duration-300 hidden md:block"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              aria-label="Cart"
              className="relative p-2 text-gray-700 hover:text-black transition-colors duration-300"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-black transition-colors duration-300"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div
              className="text-xl font-serif font-medium text-black tracking-widest cursor-pointer"
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
            >
              ÉLÉGANCE
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-700 hover:text-black transition-colors duration-300"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col space-y-6 p-6 text-center">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => handleCategoryClick(item)}
                className="text-lg sm:text-xl font-serif text-gray-700 hover:text-black transition-colors duration-300"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;