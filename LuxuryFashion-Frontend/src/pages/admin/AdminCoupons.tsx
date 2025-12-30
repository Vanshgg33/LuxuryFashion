import { useEffect, useState } from "react";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/api";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Coupon {
  _id?: string;
  id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usedCount: number;
  description?: string;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    isActive: true,
    description: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load coupons", err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateCoupon(editing._id || editing.id || "", form);
      } else {
        await createCoupon(form);
      }
      setDialogOpen(false);
      setEditing(null);
      setForm({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        isActive: true,
        description: "",
      });
      await loadCoupons();
    } catch (err: any) {
      console.error("Failed to save coupon:", err);
      alert(err.message || "Failed to save coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      await loadCoupons();
    } catch (err: any) {
      console.error("Failed to delete coupon:", err);
      alert(err.message || "Failed to delete coupon");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Coupons</h2>
          <p className="text-muted-foreground">Manage discount coupons</p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Code</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Value</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Min Order</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Used</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id || coupon.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="py-4 px-6 font-mono font-medium">{coupon.code}</td>
                    <td className="py-4 px-6 capitalize">{coupon.discountType}</td>
                    <td className="py-4 px-6 text-right">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </td>
                    <td className="py-4 px-6 text-right">₹{coupon.minOrderAmount || 0}</td>
                    <td className="py-4 px-6 text-center">
                      {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {coupon.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Inactive</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(coupon);
                            setForm(coupon);
                            setDialogOpen(true);
                          }}
                          className="btn-secondary text-xs"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id || coupon.id || "")}
                          className="btn-secondary text-xs text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Coupon Code</label>
              <input
                type="text"
                value={form.code || ""}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="input-styled w-full"
                placeholder="WELCOME50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount Type</label>
              <select
                value={form.discountType || "percentage"}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })}
                className="input-styled w-full"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Value {form.discountType === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                value={form.discountValue || 0}
                onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                className="input-styled w-full"
                min="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={form.minOrderAmount || 0}
                  onChange={(e) => setForm({ ...form, minOrderAmount: parseFloat(e.target.value) || 0 })}
                  className="input-styled w-full"
                  min="0"
                />
              </div>
              {form.discountType === "percentage" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount || 0}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: parseFloat(e.target.value) || 0 })}
                    className="input-styled w-full"
                    min="0"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-styled w-full"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.isActive !== false}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-muted-foreground">
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">Save</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setDialogOpen(false);
                  setEditing(null);
                  setForm({
                    code: "",
                    discountType: "percentage",
                    discountValue: 0,
                    minOrderAmount: 0,
                    maxDiscountAmount: 0,
                    isActive: true,
                    description: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}






