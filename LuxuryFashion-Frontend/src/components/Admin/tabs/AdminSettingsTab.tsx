import { useState } from "react";
import { Power, Truck, Clock, DollarSign, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toggleRestaurantOpen,
  toggleDelivery,
  updateDeliveryFee,
  updateMinOrderValue,
  updateOperatingHours,
  updateSettings,
} from "@/lib/api";
import { MapPicker } from "@/components/MapPicker";
import { toast } from "sonner";

interface AdminSettingsTabProps {
  settings: any;
  setSettings: (settings: any) => void;
}

export const AdminSettingsTab = ({ settings, setSettings }: AdminSettingsTabProps) => {
  const [isTogglingRestaurant, setIsTogglingRestaurant] = useState(false);
  const [isTogglingDelivery, setIsTogglingDelivery] = useState(false);
  const [isSavingFee, setIsSavingFee] = useState(false);
  const [isSavingMinOrder, setIsSavingMinOrder] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  const [showLocationSection, setShowLocationSection] = useState(false);
  const [showHoursSection, setShowHoursSection] = useState(false);

  // Local form values
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee ?? 40);
  const [minOrderValue, setMinOrderValue] = useState(settings.minOrderValue ?? 0);
  const [openingTime, setOpeningTime] = useState(settings.openingTime ?? "09:00");
  const [closingTime, setClosingTime] = useState(settings.closingTime ?? "22:00");
  const [lat, setLat] = useState(settings.lat ?? 0);
  const [lng, setLng] = useState(settings.lng ?? 0);

  const handleToggleRestaurant = async () => {
    setIsTogglingRestaurant(true);
    try {
      const newValue = !settings.isOpen;
      await toggleRestaurantOpen(newValue, "");
      setSettings({ ...settings, isOpen: newValue });
      toast.success(newValue ? "Restaurant OPEN!" : "Restaurant CLOSED");
    } catch (err: any) {
      toast.error(err.message || "Failed");
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
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setIsTogglingDelivery(false);
    }
  };

  const handleSaveDeliveryFee = async () => {
    setIsSavingFee(true);
    try {
      await updateDeliveryFee(deliveryFee);
      setSettings({ ...settings, deliveryFee });
      toast.success(`Delivery fee: ₹${deliveryFee}`);
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setIsSavingFee(false);
    }
  };

  const handleSaveMinOrder = async () => {
    setIsSavingMinOrder(true);
    try {
      await updateMinOrderValue(minOrderValue);
      setSettings({ ...settings, minOrderValue });
      toast.success(minOrderValue > 0 ? `Min order: ₹${minOrderValue}` : "Min order disabled");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setIsSavingMinOrder(false);
    }
  };

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    try {
      await updateOperatingHours(openingTime, closingTime);
      setSettings({ ...settings, openingTime, closingTime });
      toast.success(`Hours: ${openingTime} - ${closingTime}`);
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!lat || !lng) {
      toast.error("Please set location on map");
      return;
    }
    setIsSavingLocation(true);
    try {
      await updateSettings({ lat, lng });
      setSettings({ ...settings, lat, lng });
      toast.success("Location saved");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <h2 className="text-xl font-bold text-foreground">Settings</h2>

      {/* Quick Controls */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Quick Controls
        </p>

        {/* Restaurant Open/Close */}
        <div
          className={cn(
            "p-4 rounded-2xl border-2 transition-all",
            settings.isOpen
              ? "bg-emerald-50 border-emerald-300"
              : "bg-red-50 border-red-300"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                settings.isOpen ? "bg-emerald-500" : "bg-red-500"
              )}>
                <Power className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  Restaurant {settings.isOpen ? "OPEN" : "CLOSED"}
                </p>
                <p className={cn(
                  "text-sm",
                  settings.isOpen ? "text-emerald-600" : "text-red-600"
                )}>
                  {settings.isOpen ? "Accepting orders" : "Not accepting orders"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleRestaurant}
              disabled={isTogglingRestaurant}
              className={cn(
                "w-14 h-8 rounded-full transition-colors relative disabled:opacity-50",
                settings.isOpen ? "bg-emerald-500" : "bg-gray-300"
              )}
            >
              <span className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform",
                settings.isOpen ? "translate-x-7" : "translate-x-1"
              )} />
            </button>
          </div>
        </div>

        {/* Delivery Toggle */}
        <div className={cn(
          "p-4 rounded-2xl border-2 transition-all",
          settings.isDeliveryEnabled
            ? "bg-blue-50 border-blue-300"
            : "bg-amber-50 border-amber-300"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                settings.isDeliveryEnabled ? "bg-blue-500" : "bg-amber-500"
              )}>
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-foreground">Delivery</p>
                <p className={cn(
                  "text-sm",
                  settings.isDeliveryEnabled ? "text-blue-600" : "text-amber-600"
                )}>
                  {settings.isDeliveryEnabled ? "Enabled" : "Takeaway only"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleDelivery}
              disabled={isTogglingDelivery}
              className={cn(
                "w-14 h-8 rounded-full transition-colors relative disabled:opacity-50",
                settings.isDeliveryEnabled ? "bg-blue-500" : "bg-gray-300"
              )}
            >
              <span className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform",
                settings.isDeliveryEnabled ? "translate-x-7" : "translate-x-1"
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Values
        </p>

        {/* Delivery Fee */}
        {settings.isDeliveryEnabled && (
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-primary" />
              <p className="font-medium text-foreground">Delivery Fee</p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={handleSaveDeliveryFee}
                disabled={isSavingFee}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50"
              >
                {isSavingFee ? "..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Minimum Order */}
        <div className="bg-white p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-primary" />
            <p className="font-medium text-foreground">Minimum Order</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleSaveMinOrder}
              disabled={isSavingMinOrder}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {isSavingMinOrder ? "..." : "Save"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {minOrderValue > 0 ? `Customers need ₹${minOrderValue}+ to order` : "No minimum order"}
          </p>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          More
        </p>

        {/* Operating Hours */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setShowHoursSection(!showHoursSection)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Operating Hours</p>
                <p className="text-sm text-muted-foreground">
                  {settings.openingTime || "09:00"} - {settings.closingTime || "22:00"}
                </p>
              </div>
            </div>
            {showHoursSection ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showHoursSection && (
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Opening</label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Closing</label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveHours}
                disabled={isSavingHours}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50"
              >
                {isSavingHours ? "Saving..." : "Save Hours"}
              </button>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setShowLocationSection(!showLocationSection)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Restaurant Location</p>
                <p className="text-sm text-muted-foreground">
                  {settings.lat && settings.lng
                    ? `${settings.lat.toFixed(4)}, ${settings.lng.toFixed(4)}`
                    : "Not set"}
                </p>
              </div>
            </div>
            {showLocationSection ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showLocationSection && (
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                Used for 2km delivery radius. Tap map to set location.
              </p>
              <div className="rounded-xl overflow-hidden border border-border">
                <MapPicker
                  lat={lat || 22.5726}
                  lng={lng || 88.3639}
                  onChange={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                  height="200px"
                />
              </div>
              <button
                onClick={handleSaveLocation}
                disabled={isSavingLocation}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50"
              >
                {isSavingLocation ? "Saving..." : "Save Location"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
