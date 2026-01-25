import { useState, useEffect } from "react";
import { Home, Package, UtensilsCrossed, Settings, Plus, X, Power, Truck, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminHomeTab } from "./tabs/AdminHomeTab";
import { AdminOrdersTab } from "./tabs/AdminOrdersTab";
import { AdminMenuTab } from "./tabs/AdminMenuTab";
import { AdminSettingsTab } from "./tabs/AdminSettingsTab";
import { toggleRestaurantOpen, toggleDelivery, fetchSettings } from "@/lib/api";
import { toast } from "sonner";

type TabType = "home" | "orders" | "menu" | "settings";

interface MobileAdminLayoutProps {
  initialTab?: TabType;
}

export const MobileAdminLayout = ({ initialTab = "home" }: MobileAdminLayoutProps) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [fabOpen, setFabOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [isTogglingRestaurant, setIsTogglingRestaurant] = useState(false);
  const [isTogglingDelivery, setIsTogglingDelivery] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleToggleRestaurant = async () => {
    setIsTogglingRestaurant(true);
    try {
      const newValue = !settings.isOpen;
      await toggleRestaurantOpen(newValue, "");
      setSettings({ ...settings, isOpen: newValue });
      toast.success(newValue ? "Restaurant is now OPEN!" : "Restaurant is now CLOSED");
      setFabOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle restaurant");
    } finally {
      setIsTogglingRestaurant(false);
    }
  };

  const handleToggleDelivery = async () => {
    setIsTogglingDelivery(true);
    try {
      const newValue = !settings.isDeliveryEnabled;
      await toggleDelivery(newValue);
      setSettings({ ...settings, isDeliveryEnabled: newValue });
      toast.success(newValue ? "Delivery enabled" : "Delivery disabled");
      setFabOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle delivery");
    } finally {
      setIsTogglingDelivery(false);
    }
  };

  const tabs = [
    { id: "home" as TabType, icon: Home, label: "Home" },
    { id: "orders" as TabType, icon: Package, label: "Orders" },
    { id: "menu" as TabType, icon: UtensilsCrossed, label: "Menu" },
    { id: "settings" as TabType, icon: Settings, label: "Settings" },
  ];

  const fabActions = [
    {
      icon: Power,
      label: settings.isOpen ? "Close Shop" : "Open Shop",
      color: settings.isOpen ? "bg-red-500" : "bg-emerald-500",
      onClick: handleToggleRestaurant,
      loading: isTogglingRestaurant,
    },
    {
      icon: Truck,
      label: settings.isDeliveryEnabled ? "Stop Delivery" : "Start Delivery",
      color: settings.isDeliveryEnabled ? "bg-amber-500" : "bg-blue-500",
      onClick: handleToggleDelivery,
      loading: isTogglingDelivery,
    },
    {
      icon: ChefHat,
      label: "Add Dish",
      color: "bg-primary",
      onClick: () => {
        setActiveTab("menu");
        setFabOpen(false);
        // Will trigger add dish modal in menu tab
        window.dispatchEvent(new CustomEvent("admin:addDish"));
      },
      loading: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Main Content */}
      <main className="p-4">
        {activeTab === "home" && <AdminHomeTab settings={settings} setSettings={setSettings} onNavigate={setActiveTab} />}
        {activeTab === "orders" && <AdminOrdersTab />}
        {activeTab === "menu" && <AdminMenuTab />}
        {activeTab === "settings" && <AdminSettingsTab settings={settings} setSettings={setSettings} />}
      </main>

      {/* FAB with Quick Actions */}
      <div className="fixed bottom-24 right-4 z-50">
        {/* Expanded Actions */}
        {fabOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-fade-in-up">
            {fabActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.loading}
                className={cn(
                  "flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full shadow-lg text-white font-medium text-sm whitespace-nowrap transition-all hover:scale-105 disabled:opacity-50",
                  action.color
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span>{action.label}</span>
                <action.icon className={cn("w-5 h-5", action.loading && "animate-spin")} />
              </button>
            ))}
          </div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300",
            fabOpen
              ? "bg-gray-800 rotate-45"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {fabOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Overlay when FAB is open */}
      {fabOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn(
                "w-5 h-5 transition-transform",
                activeTab === tab.id && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium",
                activeTab === tab.id && "font-semibold"
              )}>
                {tab.label}
              </span>
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
