import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, UtensilsCrossed } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { cn } from "@/lib/utils";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/menu", label: "Menu" },
  { path: "/orders", label: "Orders" },
  { path: "/profile", label: "Profile" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCartContext();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">
              Foodie
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "nav-link",
                  location.pathname === link.path && "active text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart, Notifications & Profile */}
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Link
              to="/cart"
              className="relative p-2 rounded-xl hover:bg-secondary transition-colors duration-300"
            >
              <ShoppingCart className="w-6 h-6 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="hidden md:flex p-2 rounded-xl hover:bg-secondary transition-colors duration-300"
            >
              <User className="w-6 h-6 text-foreground" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors duration-300"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-xl transition-colors duration-300",
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
