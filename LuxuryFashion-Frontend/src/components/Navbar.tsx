import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Search, ChevronDown, LogOut, Heart, Settings, ShoppingCart } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/* ═══════════════════════════════════════════════════════════════════════════
   RANGEELA DHABA — PREMIUM GOLDEN NAVBAR
   Beautiful, clean navigation with golden accents
═══════════════════════════════════════════════════════════════════════════ */

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/menu", label: "Menu" },
  { path: "/orders", label: "Orders" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCartContext();
  const { user, logout, isAdmin } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Check if on homepage
  const isHomePage = location.pathname === "/";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Dynamic text color based on scroll state and page
  const textColor = isScrolled || !isHomePage ? "text-foreground" : "text-background";
  const textColorMuted = isScrolled || !isHomePage ? "text-foreground/70" : "text-background/80";
  const hoverBg = isScrolled || !isHomePage ? "hover:bg-secondary" : "hover:bg-white/10";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled || !isHomePage
            ? "bg-white/98 backdrop-blur-xl border-b border-border/30 shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg shadow-md">
                  <span className="text-foreground font-serif font-bold text-lg md:text-xl">R</span>
                </div>
              </div>
              <div className="hidden sm:flex items-baseline">
                <span className={cn(
                  "text-xl md:text-2xl font-serif font-bold tracking-tight transition-colors",
                  textColor
                )}>
                  Rangeela
                </span>
                <span className={cn(
                  "text-xl md:text-2xl font-serif font-medium tracking-tight ml-1.5 transition-colors",
                  isScrolled || !isHomePage ? "text-primary" : "text-primary"
                )}>
                  Dhaba
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                    location.pathname === link.path
                      ? "text-primary"
                      : cn(textColorMuted, hoverBg, "hover:text-foreground")
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                    location.pathname.startsWith("/admin")
                      ? "text-primary"
                      : cn(textColorMuted, hoverBg, "hover:text-foreground")
                  )}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NotificationDropdown />

              {/* Cart */}
              <Link
                to="/cart"
                className={cn(
                  "relative p-2.5 rounded-full transition-all duration-300 group",
                  hoverBg
                )}
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingBag className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", textColor)} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in shadow-glow">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User Profile / Auth */}
              {user ? (
                <Popover open={profileOpen} onOpenChange={setProfileOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-all duration-300",
                        hoverBg
                      )}
                      aria-label="User profile menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4", textColorMuted)} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-64 p-2 bg-card border border-border shadow-elevated rounded-xl"
                    align="end"
                    sideOffset={8}
                  >
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-semibold text-lg text-primary">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {user.name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-1 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                        My Orders
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        Favorites
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-primary rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="p-1 border-t border-border">
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Link
                  to="/auth"
                  className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-foreground text-sm font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-md"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "lg:hidden p-2.5 rounded-full transition-colors duration-300",
                  hoverBg
                )}
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? (
                  <X className={cn("w-5 h-5", textColor)} />
                ) : (
                  <Menu className={cn("w-5 h-5", textColor)} />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-card shadow-elevated",
            "transition-transform duration-300 ease-out",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-glow">
                <span className="text-white font-serif font-bold">R</span>
              </div>
              <span className="font-serif font-bold text-foreground">Rangeela</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm bg-secondary border-0 rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="px-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  location.pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-glow"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
