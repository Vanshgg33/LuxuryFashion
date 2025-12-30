import { useEffect, useState } from "react";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/lib/api";
import { MapPin, Plus, Edit, Trash2, Check, Navigation } from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reverseGeocode } from "@/lib/geocode";
import { getAccurateLocation } from "@/lib/geolocation";
import { toast } from "sonner";

interface Address {
  _id?: string;
  id?: string;
  label: string;
  houseNumber?: string;
  apartment?: string;
  floor?: string;
  street: string;
  area?: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [form, setForm] = useState<Partial<Address>>({
    label: "",
    houseNumber: "",
    apartment: "",
    floor: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phoneNumber: "",
  });

  useEffect(() => {
    loadAddresses();

    // Refresh when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAddresses();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load addresses", err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!form.label?.trim() || !form.street?.trim() || !form.city?.trim() || !form.state?.trim() || !form.zipCode?.trim()) {
        toast.error("Please fill in all required address fields");
        return;
      }

      if (editing) {
        await updateAddress(editing._id || editing.id || "", form);
        toast.success("Address updated successfully");
      } else {
        await createAddress(form);
        toast.success("Address added successfully");
      }
      setDialogOpen(false);
      setEditing(null);
      setForm({ 
        label: "", 
        houseNumber: "", 
        apartment: "", 
        floor: "", 
        street: "", 
        area: "", 
        landmark: "", 
        city: "", 
        state: "", 
        zipCode: "", 
        country: "India", 
        phoneNumber: "", 
        lat: undefined, 
        lng: undefined 
      });
      loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
      console.error("Failed to save address:", err);
    }
  };

  const useMyLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getAccurateLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        retries: 3,
      });

      const { latitude, longitude, accuracy } = location;
      
      // Update form with coordinates
      setForm((prev) => ({ ...prev, lat: latitude, lng: longitude }));

      // Show accuracy info
      const accuracyText = accuracy < 10 ? "very accurate" : accuracy < 50 ? "accurate" : "approximate";
      toast.success(`Location found (${accuracyText}, ±${Math.round(accuracy)}m)`);

      // Reverse geocode to get address
      try {
        const geo = await reverseGeocode(latitude, longitude);
        setForm((prev) => ({ ...prev, ...geo, lat: latitude, lng: longitude }));
      } catch (err) {
        console.error("Failed to reverse geocode:", err);
        toast.warning("Location set, but address details couldn't be fetched automatically");
      }
    } catch (err: any) {
      console.error("Geolocation error:", err);
      toast.error(err.message || "Unable to get your location. Please allow location access or select on map.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapChange = async (lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, lat, lng }));
    
    // Auto-fill address fields from coordinates
    try {
      const geo = await reverseGeocode(lat, lng);
      setForm((prev) => ({ ...prev, ...geo, lat, lng }));
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
      // Still update lat/lng even if reverse geocode fails
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      toast.success("Address deleted successfully");
      await loadAddresses();
    } catch (err: any) {
      console.error("Failed to delete address:", err);
      toast.error(err.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success("Default address updated");
      await loadAddresses();
    } catch (err: any) {
      console.error("Failed to set default address:", err);
      toast.error(err.message || "Failed to set default address");
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Saved Addresses</h1>
        <button onClick={() => setDialogOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No addresses saved</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr._id || addr.id}
              className="bg-card rounded-2xl border border-border p-6 relative"
            >
              {addr.isDefault && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Default
                </span>
              )}
              <h3 className="font-semibold text-foreground mb-2">{addr.label}</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {addr.houseNumber && <>{addr.houseNumber}, </>}
                {addr.apartment && <>{addr.apartment}, </>}
                {addr.floor && <>Floor {addr.floor}, </>}
                {addr.street}
                {addr.area && <>, {addr.area}</>}
                {addr.landmark && <><br />Near {addr.landmark}</>}
                <br />
                {addr.city}, {addr.state} {addr.zipCode}
                <br />
                {addr.country}
                {addr.phoneNumber && <><br />📞 {addr.phoneNumber}</>}
              </p>
              <div className="flex gap-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id || addr.id || "")}
                    className="btn-secondary text-xs"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditing(addr);
                    setForm({
                      ...addr,
                      lat: addr.lat || 19.076,
                      lng: addr.lng || 72.8777,
                    });
                    setDialogOpen(true);
                  }}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr._id || addr.id || "")}
                  className="btn-secondary text-xs text-destructive flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Label (e.g., Home, Work)"
              value={form.label || ""}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="input-styled"
              required
            />
            
            {/* Building Details */}
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="House/Building No."
                value={form.houseNumber || ""}
                onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                className="input-styled"
              />
              <input
                type="text"
                placeholder="Apartment/Flat No."
                value={form.apartment || ""}
                onChange={(e) => setForm({ ...form, apartment: e.target.value })}
                className="input-styled"
              />
              <input
                type="text"
                placeholder="Floor (optional)"
                value={form.floor || ""}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="input-styled"
              />
            </div>

            <input
              type="text"
              placeholder="Street Address *"
              value={form.street || ""}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              className="input-styled"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Area/Locality"
                value={form.area || ""}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="input-styled"
              />
              <input
                type="text"
                placeholder="Landmark (optional)"
                value={form.landmark || ""}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                className="input-styled"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City *"
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-styled"
                required
              />
              <input
                type="text"
                placeholder="State *"
                value={form.state || ""}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input-styled"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="ZIP Code *"
                value={form.zipCode || ""}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                className="input-styled"
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={form.phoneNumber || ""}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="input-styled"
              />
            </div>
            
            {/* Location Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Location (Click on map to set)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useMyLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2"
                >
                  <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                  {isGettingLocation ? "Getting Location..." : "Use My Location"}
                </Button>
              </div>
              <MapPicker
                lat={form.lat || 19.076}
                lng={form.lng || 72.8777}
                onChange={handleMapChange}
                height="200px"
              />
              {form.lat && form.lng && (
                <p className="text-xs text-muted-foreground">
                  Coordinates: {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="default"
                checked={form.isDefault || false}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              <label htmlFor="default" className="text-sm text-muted-foreground">
                Set as default address
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">Save</Button>
              <Button variant="secondary" onClick={() => {
                setDialogOpen(false);
                setEditing(null);
                setForm({ 
                  label: "", 
                  houseNumber: "", 
                  apartment: "", 
                  floor: "", 
                  street: "", 
                  area: "", 
                  landmark: "", 
                  city: "", 
                  state: "", 
                  zipCode: "", 
                  country: "India", 
                  phoneNumber: "" 
                });
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}






