import { useEffect, useState } from "react";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/lib/api";
import { MapPin, Plus, Edit, Trash2, Check } from "lucide-react";
import { MapPicker } from "@/components/MapPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Address {
  _id?: string;
  id?: string;
  label: string;
  street: string;
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
  const [form, setForm] = useState<Partial<Address>>({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phoneNumber: "",
  });

  useEffect(() => {
    loadAddresses();
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
      if (editing) {
        await updateAddress(editing._id || editing.id || "", form);
        
      } else {
        await createAddress(form);
        
      }
      setDialogOpen(false);
      setEditing(null);
      setForm({ label: "", street: "", city: "", state: "", zipCode: "", country: "India", phoneNumber: "" });
      loadAddresses();
    } catch (err: any) {
      
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      
      loadAddresses();
    } catch (err: any) {
      
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      
      loadAddresses();
    } catch (err: any) {
      
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
              <p className="text-muted-foreground mb-4">
                {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                <br />
                {addr.country}
                {addr.phoneNumber && <><br />{addr.phoneNumber}</>}
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
                    setForm(addr);
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
            />
            <input
              type="text"
              placeholder="Street Address"
              value={form.street || ""}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              className="input-styled"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-styled"
              />
              <input
                type="text"
                placeholder="State"
                value={form.state || ""}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="input-styled"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="ZIP Code"
                value={form.zipCode || ""}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                className="input-styled"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={form.phoneNumber || ""}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="input-styled"
              />
            </div>
            {form.lat && form.lng && (
              <MapPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => setForm({ ...form, lat, lng })}
                height="200px"
              />
            )}
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
                setForm({ label: "", street: "", city: "", state: "", zipCode: "", country: "India", phoneNumber: "" });
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






