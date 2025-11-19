import React from "react";
import { Home, Search, User, ShoppingBag, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/shop" },
    { icon: Heart, label: "Wishlist", path: "/wishlist" },
    { icon: User, label: "Account", path: isAuthenticated ? "/orders" : "/login" },
    { icon: ShoppingBag, label: "Cart", path: "/cart", badge: cartCount },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 relative transition-colors ${
                active ? "text-black" : "text-gray-600"
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;







