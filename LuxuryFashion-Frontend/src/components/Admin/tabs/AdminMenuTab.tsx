import { useState, useEffect, useMemo } from "react";
import { Search, X, Eye, EyeOff, Pencil, Trash2, Plus, Package, ChevronDown, ChevronUp, Image, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProducts, updateDish, deleteDish, createDish, updateCategoryStock } from "@/lib/api";
import { FOOD_CATEGORY_OPTIONS, DISH_CATEGORY_OPTIONS } from "@/constants/dishCategories";
import { compressImageForUpload } from "@/lib/imageUtils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AdminMenuTab = () => {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [togglingCategory, setTogglingCategory] = useState<string | null>(null);
  const [savingDish, setSavingDish] = useState(false);

  const [dishForm, setDishForm] = useState({
    name: "",
    price: "",
    foodCategory: "",
    dishCategory: "",
    description: "",
    inStock: true,
    image: null as File | null,
    hasHalfPortion: false,
    halfPortionPrice: "",
    isBuyOneGetOne: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadDishes();
    // Listen for add dish event from FAB
    const handleAddDish = () => setShowAddModal(true);
    window.addEventListener("admin:addDish", handleAddDish);
    return () => window.removeEventListener("admin:addDish", handleAddDish);
  }, []);

  const loadDishes = async () => {
    try {
      const data = await fetchProducts();
      setDishes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load dishes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Category stock status
  const categoryStockStatus = useMemo(() => {
    const status: Record<string, { total: number; inStock: number; allInStock: boolean }> = {};
    dishes.forEach((dish) => {
      const category = dish.dishCategory || "Uncategorized";
      if (!status[category]) {
        status[category] = { total: 0, inStock: 0, allInStock: true };
      }
      status[category].total++;
      if (dish.inStock) status[category].inStock++;
    });
    Object.keys(status).forEach((cat) => {
      status[cat].allInStock = status[cat].inStock === status[cat].total;
    });
    return status;
  }, [dishes]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    const query = searchQuery.toLowerCase();
    return dishes.filter(
      (dish) =>
        dish.name?.toLowerCase().includes(query) ||
        dish.dishCategory?.toLowerCase().includes(query)
    );
  }, [dishes, searchQuery]);

  const handleToggleCategoryStock = async (category: string, currentlyInStock: boolean) => {
    setTogglingCategory(category);
    try {
      const newStatus = !currentlyInStock;
      await updateCategoryStock(category, newStatus);
      setDishes((prev) =>
        prev.map((d) => (d.dishCategory === category ? { ...d, inStock: newStatus } : d))
      );
      toast.success(`${category}: All items ${newStatus ? "in stock" : "out of stock"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setTogglingCategory(null);
    }
  };

  const handleToggleDishStock = async (dish: any) => {
    try {
      await updateDish(dish._id, { inStock: !dish.inStock });
      setDishes((prev) =>
        prev.map((d) => (d._id === dish._id ? { ...d, inStock: !d.inStock } : d))
      );
      toast.success(`${dish.name} is now ${!dish.inStock ? "in stock" : "out of stock"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm("Delete this dish?")) return;
    try {
      await deleteDish(id);
      setDishes((prev) => prev.filter((d) => d._id !== id));
      toast.success("Dish deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleEditDish = (dish: any) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name || "",
      price: String(dish.price || ""),
      foodCategory: dish.foodCategory || "",
      dishCategory: dish.dishCategory || "",
      description: dish.description || "",
      inStock: dish.inStock !== false,
      image: null,
      hasHalfPortion: dish.hasHalfPortion || false,
      halfPortionPrice: dish.halfPortionPrice ? String(dish.halfPortionPrice) : "",
      isBuyOneGetOne: dish.isBuyOneGetOne || false,
    });
    setImagePreview(dish.imageUrl || null);
  };

  const handleSaveDish = async () => {
    if (!dishForm.name || !dishForm.price) {
      toast.error("Name and price are required");
      return;
    }
    setSavingDish(true);
    try {
      const data = {
        name: dishForm.name,
        price: parseFloat(dishForm.price),
        foodCategory: dishForm.foodCategory || undefined,
        dishCategory: dishForm.dishCategory || undefined,
        description: dishForm.description || undefined,
        inStock: dishForm.inStock,
        image: dishForm.image || undefined,
        hasHalfPortion: dishForm.hasHalfPortion,
        halfPortionPrice: dishForm.hasHalfPortion && dishForm.halfPortionPrice
          ? parseFloat(dishForm.halfPortionPrice)
          : undefined,
        isBuyOneGetOne: dishForm.isBuyOneGetOne,
      };

      if (editingDish) {
        await updateDish(editingDish._id, data);
        toast.success("Dish updated");
      } else {
        await createDish(data);
        toast.success("Dish created");
      }

      resetForm();
      await loadDishes();
    } catch (err: any) {
      toast.error(err.message || "Failed to save dish");
    } finally {
      setSavingDish(false);
    }
  };

  const resetForm = () => {
    setDishForm({
      name: "",
      price: "",
      foodCategory: "",
      dishCategory: "",
      description: "",
      inStock: true,
      image: null,
      hasHalfPortion: false,
      halfPortionPrice: "",
      isBuyOneGetOne: false,
    });
    setImagePreview(null);
    setEditingDish(null);
    setShowAddModal(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageForUpload(file);
        setDishForm({ ...dishForm, image: compressed });
        setImagePreview(URL.createObjectURL(compressed));
      } catch (err) {
        toast.error("Failed to process image");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Menu</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category Toggles */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Category Stock
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {Object.entries(categoryStockStatus).map(([category, status]) => (
            <button
              key={category}
              onClick={() => handleToggleCategoryStock(category, status.allInStock)}
              disabled={togglingCategory === category}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all disabled:opacity-50",
                status.allInStock
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {status.allInStock ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              {category}
              <span className="text-xs opacity-70">
                ({status.inStock}/{status.total})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dishes List */}
      {filteredDishes.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            {searchQuery ? "No dishes found" : "No dishes yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDishes.map((dish) => (
            <div
              key={dish._id}
              className={cn(
                "flex items-center gap-3 p-3 bg-white rounded-xl border transition-all",
                dish.inStock ? "border-emerald-200" : "border-red-200 opacity-75"
              )}
            >
              {/* Image */}
              {dish.imageUrl ? (
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Image className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{dish.name}</p>
                  {dish.isBuyOneGetOne && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                      BOGO
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">₹{dish.price}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-xs font-medium",
                    dish.inStock ? "text-emerald-600" : "text-red-600"
                  )}>
                    {dish.inStock ? "In Stock" : "Out"}
                  </span>
                  {dish.dishCategory && (
                    <span className="text-xs text-muted-foreground">
                      • {dish.dishCategory}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggleDishStock(dish)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    dish.inStock
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-red-100 text-red-600"
                  )}
                >
                  {dish.inStock ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEditDish(dish)}
                  className="p-2 rounded-lg bg-blue-100 text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDish(dish._id)}
                  className="p-2 rounded-lg bg-red-100 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || !!editingDish} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDish ? "Edit Dish" : "Add New Dish"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload */}
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors",
                imagePreview ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
              onClick={() => document.getElementById("dish-image-input")?.click()}
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  <p className="text-xs text-muted-foreground">Tap to change</p>
                </div>
              ) : (
                <div className="py-4">
                  <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Tap to upload image</p>
                </div>
              )}
              <input
                id="dish-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Name & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Name *</label>
                <input
                  type="text"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Dish name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Price *</label>
                <input
                  type="number"
                  value={dishForm.price}
                  onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="₹0"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select
                  value={dishForm.foodCategory}
                  onValueChange={(v) => setDishForm({ ...dishForm, foodCategory: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Veg/Non-Veg" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select
                  value={dishForm.dishCategory}
                  onValueChange={(v) => setDishForm({ ...dishForm, dishCategory: v })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISH_CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={dishForm.description}
                onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
                placeholder="Optional description..."
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {/* In Stock */}
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                <span className="text-sm font-medium">In Stock</span>
                <button
                  type="button"
                  onClick={() => setDishForm({ ...dishForm, inStock: !dishForm.inStock })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    dishForm.inStock ? "bg-emerald-500" : "bg-gray-300"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    dishForm.inStock ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Half Portion */}
              <div className="p-3 bg-secondary/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Half Portion</span>
                  <button
                    type="button"
                    onClick={() => setDishForm({ ...dishForm, hasHalfPortion: !dishForm.hasHalfPortion })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      dishForm.hasHalfPortion ? "bg-primary" : "bg-gray-300"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      dishForm.hasHalfPortion ? "translate-x-7" : "translate-x-1"
                    )} />
                  </button>
                </div>
                {dishForm.hasHalfPortion && (
                  <input
                    type="number"
                    value={dishForm.halfPortionPrice}
                    onChange={(e) => setDishForm({ ...dishForm, halfPortionPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm"
                    placeholder="Half portion price"
                  />
                )}
              </div>

              {/* BOGO */}
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                <span className="text-sm font-medium">Buy 1 Get 1 Free</span>
                <button
                  type="button"
                  onClick={() => setDishForm({ ...dishForm, isBuyOneGetOne: !dishForm.isBuyOneGetOne })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    dishForm.isBuyOneGetOne ? "bg-purple-500" : "bg-gray-300"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    dishForm.isBuyOneGetOne ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="secondary" onClick={resetForm} disabled={savingDish} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveDish} disabled={savingDish} className="w-full sm:w-auto">
              {savingDish ? "Saving..." : editingDish ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
