import { useEffect, useState } from "react";
import { fetchProfile, updateProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, Save } from "lucide-react";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", phoneNumber: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Handle both old 'phone' and new 'phoneNumber' field names for backward compatibility
      setForm({ name: user.name || "", phoneNumber: user.phoneNumber || user.phone || "" });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const updated = await updateProfile(form);
      setUser(updated);
      
    } catch (err: any) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">Settings</h1>
      
      <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-styled w-full"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="input-styled w-full opacity-50"
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className="input-styled w-full"
            placeholder="Your phone number"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </main>
  );
}






