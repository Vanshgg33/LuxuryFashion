import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, ArrowLeft, Ticket, Image, Bell, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminOrderNotifications } from "@/hooks/useAdminOrderNotifications";
import { useState } from "react";

const adminNavItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { path: "/admin/coupons", label: "Coupons", icon: Ticket },
  { path: "/admin/banners", label: "Banners", icon: Image },
];

export function AdminLayout() {
  const location = useLocation();
  const { hasNewOrder, newOrdersCount, clearNewOrdersIndicator, toggleSound } = useAdminOrderNotifications();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </Link>
              <h1 className="text-xl font-display font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Sound Toggle */}
              <button
                onClick={handleSoundToggle}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  soundEnabled
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-secondary"
                )}
                title={soundEnabled ? "Disable sound notifications" : "Enable sound notifications"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>

              {/* New Order Notification Badge */}
              {hasNewOrder && (
                <Link
                  to="/admin/orders"
                  onClick={clearNewOrdersIndicator}
                  className="relative p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300 group"
                >
                  <Bell className="w-5 h-5 text-primary animate-pulse" />
                  {/* Pulsing Ring Animation */}
                  <span className="absolute inset-0 rounded-xl bg-primary/20 animate-ping opacity-75" />
                  {/* Badge Count */}
                  {newOrdersCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in shadow-glow">
                      {newOrdersCount > 99 ? "99+" : newOrdersCount}
                    </span>
                  )}
                  {/* Tooltip */}
                  <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    New order{newOrdersCount > 1 ? "s" : ""} arrived!
                  </div>
                </Link>
              )}

              <nav className="flex items-center gap-2">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isOrdersPage = item.path === "/admin/orders";
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={isOrdersPage ? clearNewOrdersIndicator : undefined}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                      {/* Notification indicator on Orders nav item */}
                      {isOrdersPage && hasNewOrder && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
