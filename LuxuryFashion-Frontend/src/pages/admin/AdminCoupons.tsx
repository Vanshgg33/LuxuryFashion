import { useEffect, useState } from "react";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, fetchProducts } from "@/lib/api";
import { Plus, Edit, Trash2, Check, X, Gift, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Dish {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface FreeItem {
  dish: string | Dish;
  quantity: number;
}

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
  freeItems?: FreeItem[];
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
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
    freeItems: [],
    validFrom: "",
    validUntil: "",
    usageLimit: 0,
  });
  const [selectedDish, setSelectedDish] = useState<string>("");
  const [freeItemQty, setFreeItemQty] = useState<number>(1);

  useEffect(() => {
    loadCoupons();
    loadDishes();
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

  const loadDishes = async () => {
    try {
      const data = await fetchProducts();
      setDishes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load dishes", err);
      setDishes([]);
    }
  };

  const addFreeItem = () => {
    if (!selectedDish) return;
    const existingItems = form.freeItems || [];
    // Check if dish already exists
    if (existingItems.some((item) => (typeof item.dish === 'string' ? item.dish : item.dish._id) === selectedDish)) {
      alert("This dish is already added as a free item");
      return;
    }
    setForm({
      ...form,
      freeItems: [...existingItems, { dish: selectedDish, quantity: freeItemQty }],
    });
    setSelectedDish("");
    setFreeItemQty(1);
  };

  const removeFreeItem = (dishId: string) => {
    setForm({
      ...form,
      freeItems: (form.freeItems || []).filter((item) =>
        (typeof item.dish === 'string' ? item.dish : item.dish._id) !== dishId
      ),
    });
  };

  const getDishName = (dishId: string): string => {
    const dish = dishes.find((d) => d._id === dishId);
    return dish?.name || "Unknown Dish";
  };

  const handleSave = async () => {
    try {
      // Transform freeItems to only send dish IDs and clean up dates
      const payload: any = {
        ...form,
        freeItems: (form.freeItems || []).map((item) => ({
          dish: typeof item.dish === 'string' ? item.dish : item.dish._id,
          quantity: item.quantity,
        })),
      };

      // Only include dates if they have valid values
      if (!form.validFrom) delete payload.validFrom;
      if (!form.validUntil) delete payload.validUntil;

      // Ensure usageLimit is a number (0 means unlimited)
      payload.usageLimit = form.usageLimit || 0;

      if (editing) {
        await updateCoupon(editing._id || editing.id || "", payload);
      } else {
        await createCoupon(payload);
      }
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      await loadCoupons();
    } catch (err: any) {
      console.error("Failed to save coupon:", err);
      alert(err.message || "Failed to save coupon");
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      isActive: true,
      description: "",
      freeItems: [],
      validFrom: "",
      validUntil: "",
      usageLimit: 0,
    });
    setSelectedDish("");
    setFreeItemQty(1);
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
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Validity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Free Items</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Used</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
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
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        {coupon.validFrom || coupon.validUntil ? (
                          <>
                            {coupon.validFrom && (
                              <div className="text-muted-foreground">
                                From: {new Date(coupon.validFrom).toLocaleDateString()}
                              </div>
                            )}
                            {coupon.validUntil && (
                              <div className="text-muted-foreground">
                                Until: {new Date(coupon.validUntil).toLocaleDateString()}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Always valid</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {coupon.freeItems && coupon.freeItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {coupon.freeItems.map((item, idx) => {
                            const dishName = typeof item.dish === 'string'
                              ? getDishName(item.dish)
                              : item.dish?.name || 'Unknown';
                            return (
                              <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                <Gift className="w-3 h-3" />
                                {item.quantity}x {dishName}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
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

            {/* Validity Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Valid From (Optional)</label>
                <input
                  type="datetime-local"
                  value={form.validFrom ? new Date(form.validFrom).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="input-styled w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valid Until (Optional)</label>
                <input
                  type="datetime-local"
                  value={form.validUntil ? new Date(form.validUntil).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                  className="input-styled w-full"
                />
              </div>
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium mb-2">Usage Limit (0 = Unlimited)</label>
              <input
                type="number"
                value={form.usageLimit || 0}
                onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })}
                className="input-styled w-full"
                min="0"
                placeholder="Leave at 0 for unlimited usage"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set to 0 for unlimited uses, or specify a number to limit usage
              </p>
            </div>

            {/* Free Items Section */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <label className="block text-sm font-medium">
                <Gift className="w-4 h-4 inline mr-2" />
                Free Items (Optional)
              </label>
              <p className="text-xs text-muted-foreground">
                Add dishes that customers will receive for free when using this coupon
              </p>

              {/* Selected Free Items */}
              {form.freeItems && form.freeItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.freeItems.map((item, idx) => {
                    const dishId = typeof item.dish === 'string' ? item.dish : item.dish._id;
                    const dishName = typeof item.dish === 'string' ? getDishName(item.dish) : item.dish?.name || 'Unknown';
                    return (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                      >
                        <Gift className="w-3 h-3" />
                        {item.quantity}x {dishName}
                        <button
                          type="button"
                          onClick={() => removeFreeItem(dishId)}
                          className="hover:text-red-600 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Add Free Item */}
              <div className="flex gap-2">
                <select
                  value={selectedDish}
                  onChange={(e) => setSelectedDish(e.target.value)}
                  className="input-styled flex-1"
                >
                  <option value="">Select a dish...</option>
                  {dishes.map((dish) => (
                    <option key={dish._id} value={dish._id}>
                      {dish.name} - ₹{dish.price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={freeItemQty}
                  onChange={(e) => setFreeItemQty(parseInt(e.target.value) || 1)}
                  className="input-styled w-20 text-center"
                  placeholder="Qty"
                />
                <Button type="button" variant="secondary" onClick={addFreeItem} disabled={!selectedDish}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
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
                  resetForm();
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






