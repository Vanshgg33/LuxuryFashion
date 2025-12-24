import { Users, ShoppingBag, DollarSign, TrendingUp, Eye, EyeOff, Trash2, Image, Pencil, X, Check, Package, Plus, Upload } from "lucide-react";
import { StatCard } from "@/components/Admin/StatCard";
import {
  fetchAnalyticsSummary,
  fetchAnalyticsStatus,
  fetchAnalyticsRevenue,
  fetchAnalyticsBestSellers,
  fetchAdminOrders,
  uploadBanner,
  createDish,
  updateDish,
  deleteDish,
  fetchSettings,
  updateSettings,
  fetchAdminBanners,
  fetchBannerLimit,
  toggleBannerActive,
  deleteBanner,
  fetchProducts,
} from "@/lib/api";
import { MapPicker } from "@/components/MapPicker";
import { useState, useMemo, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FOOD_CATEGORY_OPTIONS, DISH_CATEGORY_OPTIONS } from "@/constants/dishCategories";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [statusData, setStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [dishForm, setDishForm] = useState({
    name: "",
    price: "",
    foodCategory: "",
    dishCategory: "",
    description: "",
    inStock: true,
    image: null as File | null,
  });
  const [settingsForm, setSettingsForm] = useState<{ lat?: number; lng?: number; address?: string }>({});
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingDish, setUploadingDish] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [dishPreview, setDishPreview] = useState<string | null>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerLimit, setBannerLimit] = useState<{ current: number; max: number; canAdd: boolean } | null>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [editDishForm, setEditDishForm] = useState<{
    name: string;
    price: string;
    foodCategory: string;
    dishCategory: string;
    description: string;
    inStock: boolean;
    image: File | null;
  }>({ name: "", price: "", foodCategory: "", dishCategory: "", description: "", inStock: true, image: null });
  const [editDishPreview, setEditDishPreview] = useState<string | null>(null);
  const [savingDish, setSavingDish] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);

  const loadData = useMemo(() => async () => {
    try {
      const [ordersRes, summaryRes, statusRes, revenueRes, bestRes, settingsRes, bannersRes, limitRes, dishesRes] = await Promise.all([
        fetchAdminOrders(),
        fetchAnalyticsSummary(),
        fetchAnalyticsStatus(),
        fetchAnalyticsRevenue(),
        fetchAnalyticsBestSellers(),
        fetchSettings(),
        fetchAdminBanners().catch(() => []),
        fetchBannerLimit().catch(() => ({ current: 0, max: 4, canAdd: true })),
        fetchProducts().catch(() => []),
      ]);
      setOrders(Array.isArray(ordersRes) ? ordersRes : []);
      setSummary(summaryRes || {});
      setStatusData(
        (statusRes || []).map((s: any) => ({
          name: s.status || "unknown",
          value: s.count,
          fill: s.status === "delivered" ? "hsl(142, 25%, 35%)" : s.status === "preparing" ? "hsl(45, 80%, 55%)" : "hsl(15, 60%, 55%)",
        }))
      );
      setRevenueData(
        (revenueRes || []).map((r: any) => ({
          month: r._id,
          revenue: r.revenue,
        }))
      );
      setBestSellers(
        (bestRes || []).map((b: any) => ({
          name: b._id || b.name,
          orders: b.orders,
          revenue: b.revenue,
        }))
      );
      setSettingsForm({
        lat: settingsRes?.lat,
        lng: settingsRes?.lng,
        address: settingsRes?.address,
      });
      setBanners(Array.isArray(bannersRes) ? bannersRes : []);
      setBannerLimit(limitRes);
      setDishes(Array.isArray(dishesRes) ? dishesRes : []);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalUsers = summary.totalUsers ?? new Set(orders.map((o) => o.user?.id || o.userId)).size;
  const totalOrders = summary.totalOrders ?? orders.length;
  const totalRevenue =
    (summary.totalRevenue ??
      orders.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || o.total || 0), 0)) || 0;
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(142, 25%, 35%)",
    },
  };
  const orderStatusData = statusData.length
    ? statusData
    : [
        { name: "Delivered", value: 0, fill: "hsl(142, 25%, 35%)" },
        { name: "Preparing", value: 0, fill: "hsl(45, 80%, 55%)" },
        { name: "Pending", value: 0, fill: "hsl(15, 60%, 55%)" },
      ];

  const handleBannerUpload = async () => {
    if (!bannerFile) return;
    if (bannerLimit && !bannerLimit.canAdd) return;
    setUploadingBanner(true);
    try {
      await uploadBanner(bannerFile, bannerTitle);
      setBannerFile(null);
      setBannerTitle("");
      setBannerPreview(null);
      await loadData();
    } catch (err: any) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleToggleBanner = async (id: string) => {
    try {
      await toggleBannerActive(id);
      setBanners((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch (err: any) {
      console.error("Failed to update:", err);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      await loadData();
    } catch (err: any) {
      console.error("Failed to delete:", err);
    }
  };

  const handleDishCreate = async () => {
    if (!dishForm.name || !dishForm.price) return;
    setUploadingDish(true);
    try {
      await createDish({
        name: dishForm.name,
        price: parseFloat(dishForm.price),
        foodCategory: dishForm.foodCategory || undefined,
        dishCategory: dishForm.dishCategory || undefined,
        description: dishForm.description,
        inStock: dishForm.inStock,
        image: dishForm.image || undefined,
      });
      setDishForm({ name: "", price: "", foodCategory: "", dishCategory: "", description: "", inStock: true, image: null });
      setDishPreview(null);
      setShowAddDish(false);
      await loadData();
    } catch (err: any) {
      console.error("Failed to create dish:", err);
    } finally {
      setUploadingDish(false);
    }
  };

  const handleToggleDishStock = async (dish: any) => {
    try {
      await updateDish(dish._id, { inStock: !dish.inStock });
      setDishes((prev) =>
        prev.map((d) => (d._id === dish._id ? { ...d, inStock: !d.inStock } : d))
      );
    } catch (err: any) {
      console.error("Failed to update:", err);
    }
  };

  const handleEditDish = (dish: any) => {
    setEditingDish(dish);
    setEditDishForm({
      name: dish.name || "",
      price: String(dish.price || ""),
      foodCategory: dish.foodCategory || "",
      dishCategory: dish.dishCategory || "",
      description: dish.description || "",
      inStock: dish.inStock !== false,
      image: null,
    });
    setEditDishPreview(dish.imageUrl || null);
  };

  const handleCloseEditDish = () => {
    setEditingDish(null);
    setEditDishForm({ name: "", price: "", foodCategory: "", dishCategory: "", description: "", inStock: true, image: null });
    setEditDishPreview(null);
  };

  const handleSaveEditDish = async () => {
    if (!editingDish) return;
    if (!editDishForm.name || !editDishForm.price) return;
    setSavingDish(true);
    try {
      await updateDish(editingDish._id, {
        name: editDishForm.name,
        price: parseFloat(editDishForm.price),
        foodCategory: editDishForm.foodCategory || undefined,
        dishCategory: editDishForm.dishCategory || undefined,
        description: editDishForm.description || undefined,
        inStock: editDishForm.inStock,
        image: editDishForm.image || undefined,
      });
      handleCloseEditDish();
      await loadData();
    } catch (err: any) {
      console.error("Failed to update dish:", err);
    } finally {
      setSavingDish(false);
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm("Delete this dish?")) return;
    try {
      await deleteDish(id);
      setDishes((prev) => prev.filter((d) => d._id !== id));
    } catch (err: any) {
      console.error("Failed to delete:", err);
    }
  };

  const handleSettingsSave = async () => {
    try {
      await updateSettings({
        lat: settingsForm.lat,
        lng: settingsForm.lng,
        address: settingsForm.address,
      });
    } catch (err: any) {
      console.error("Failed to save settings:", err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${totalOrders ? Math.round(totalRevenue / totalOrders) : 0}`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Monthly Revenue</h3>
          <ChartContainer config={chartConfig} className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="hsl(142, 25%, 35%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Order Status</h3>
          <div className="flex items-center justify-center h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-3 sm:mt-4">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-xs sm:text-sm text-muted-foreground">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Top Selling Items</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Item</th>
                <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Orders</th>
                <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((item, index) => (
                <tr key={item.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground text-sm sm:text-base truncate">{item.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 sm:py-4 px-3 sm:px-4 text-foreground text-sm">{item.orders}</td>
                  <td className="text-right py-3 sm:py-4 px-3 sm:px-4 font-semibold text-primary text-sm">₹{item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Uploads & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Banners</h3>
            {bannerLimit && (
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", bannerLimit.canAdd ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                {bannerLimit.current}/{bannerLimit.max}
              </span>
            )}
          </div>

          {/* Existing Banners */}
          {banners.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className={`flex items-center gap-3 p-2 rounded-lg border ${banner.isActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-border bg-secondary/30 opacity-60'}`}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    className="w-16 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {banner.title || "Untitled"}
                    </p>
                    <p className={`text-xs ${banner.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleBanner(banner._id)}
                      className={`p-1.5 rounded-lg transition-colors ${banner.isActive ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      title={banner.isActive ? "Deactivate" : "Activate"}
                    >
                      {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner._id)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {banners.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No banners uploaded yet</p>
            </div>
          )}

          {/* Upload New Banner */}
          {bannerLimit?.canAdd && (
            <div className="pt-3 border-t border-border space-y-3">
              <p className="text-sm font-medium text-foreground">Add New Banner</p>
              <input
                type="text"
                placeholder="Title (optional)"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="input-styled"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setBannerFile(file);
                  if (file) setBannerPreview(URL.createObjectURL(file));
                }}
              />
              {bannerPreview && (
                <div className="rounded-xl overflow-hidden border border-border">
                  <img src={bannerPreview} alt="preview" className="w-full h-32 object-cover" />
                </div>
              )}
              {uploadingBanner && <Progress value={60} className="h-2" />}
              <button className="btn-primary w-full disabled:opacity-50" onClick={handleBannerUpload} disabled={uploadingBanner}>
                {uploadingBanner ? "Uploading..." : "Upload Banner"}
              </button>
            </div>
          )}

          {bannerLimit && !bannerLimit.canAdd && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
              Maximum {bannerLimit.max} banners reached. Delete one to add more.
            </p>
          )}
        </div>

        <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Dishes</h3>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
              {dishes.length} items
            </span>
          </div>

          {/* Existing Dishes */}
          {dishes.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {dishes.map((dish) => (
                <div
                  key={dish._id}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 p-2 rounded-lg border transition-all",
                    dish.inStock ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
                  )}
                >
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{dish.name}</p>
                    <p className="text-xs text-muted-foreground">₹{dish.price}</p>
                    <p className={cn("text-xs", dish.inStock ? 'text-emerald-600' : 'text-red-600')}>
                      {dish.inStock ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleDishStock(dish)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        dish.inStock ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                      )}
                      title={dish.inStock ? "Mark Out of Stock" : "Mark In Stock"}
                    >
                      {dish.inStock ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                    <button
                      onClick={() => handleEditDish(dish)}
                      className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish._id)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dishes.length === 0 && !showAddDish && (
            <div className="text-center py-4 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No dishes added yet</p>
            </div>
          )}

          {/* Add New Dish Toggle */}
          {!showAddDish ? (
            <button
              onClick={() => setShowAddDish(true)}
              className="btn-outline w-full text-sm"
            >
              + Add New Dish
            </button>
          ) : (
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Add New Dish</p>
                <button onClick={() => setShowAddDish(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Name"
                value={dishForm.name}
                onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                className="input-styled"
              />
              <input
                type="number"
                placeholder="Price"
                value={dishForm.price}
                onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                className="input-styled"
              />
              <Select
                value={dishForm.foodCategory}
                onValueChange={(value) => setDishForm({ ...dishForm, foodCategory: value })}
              >
                <SelectTrigger className="input-styled">
                  <SelectValue placeholder="Veg/Non-Veg" />
                </SelectTrigger>
                <SelectContent>
                  {FOOD_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={dishForm.dishCategory}
                onValueChange={(value) => setDishForm({ ...dishForm, dishCategory: value })}
              >
                <SelectTrigger className="input-styled">
                  <SelectValue placeholder="Dish Category" />
                </SelectTrigger>
                <SelectContent>
                  {DISH_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <textarea
                placeholder="Description"
                value={dishForm.description}
                onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                className="input-styled text-sm"
                rows={2}
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={dishForm.inStock}
                  onChange={(e) => setDishForm({ ...dishForm, inStock: e.target.checked })}
                />
                In Stock
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setDishForm({ ...dishForm, image: file });
                  if (file) setDishPreview(URL.createObjectURL(file));
                }}
              />
              {dishPreview && (
                <div className="rounded-xl overflow-hidden border border-border">
                  <img src={dishPreview} alt="preview" className="w-full h-24 object-cover" />
                </div>
              )}
              {uploadingDish && <Progress value={60} className="h-2" />}
              <button className="btn-primary w-full disabled:opacity-50" onClick={handleDishCreate} disabled={uploadingDish}>
                {uploadingDish ? "Saving..." : "Save Dish"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Restaurant Location</h3>
          <input
            type="number"
            placeholder="Latitude"
            value={settingsForm.lat ?? ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, lat: parseFloat(e.target.value) })}
            className="input-styled"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={settingsForm.lng ?? ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, lng: parseFloat(e.target.value) })}
            className="input-styled"
          />
          <input
            type="text"
            placeholder="Address"
            value={settingsForm.address ?? ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
            className="input-styled"
          />
          <button className="btn-primary w-full" onClick={handleSettingsSave}>
            Save Settings
          </button>
          <p className="text-xs text-muted-foreground">
            Used for the 5 km delivery rule. Ensure coordinates are accurate.
          </p>
          <MapPicker
            lat={settingsForm.lat || 19.076}
            lng={settingsForm.lng || 72.8777}
            onChange={(lat, lng) => setSettingsForm({ ...settingsForm, lat, lng })}
            height="220px"
          />
        </div>
      </div>

      {/* Edit Dish Modal */}
      <Dialog open={!!editingDish} onOpenChange={(open) => !open && handleCloseEditDish()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Dish</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Dish Image</label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer",
                  editDishPreview
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => document.getElementById("edit-dish-image")?.click()}
              >
                {editDishPreview ? (
                  <div className="space-y-2">
                    <img
                      src={editDishPreview}
                      alt="Preview"
                      className="w-full h-32 sm:h-40 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-xs text-muted-foreground">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                )}
                <input
                  id="edit-dish-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) return;
                      setEditDishForm({ ...editDishForm, image: file });
                      setEditDishPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name *</label>
              <input
                type="text"
                value={editDishForm.name}
                onChange={(e) => setEditDishForm({ ...editDishForm, name: e.target.value })}
                placeholder="Dish name"
                className="input-styled w-full"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price (₹) *</label>
              <input
                type="number"
                value={editDishForm.price}
                onChange={(e) => setEditDishForm({ ...editDishForm, price: e.target.value })}
                placeholder="0.00"
                className="input-styled w-full"
                min="0"
                step="0.01"
              />
            </div>

            {/* Categories Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Food Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Veg/Non-Veg</label>
                <Select
                  value={editDishForm.foodCategory}
                  onValueChange={(value) => setEditDishForm({ ...editDishForm, foodCategory: value })}
                >
                  <SelectTrigger className="input-styled">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dish Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select
                  value={editDishForm.dishCategory}
                  onValueChange={(value) => setEditDishForm({ ...editDishForm, dishCategory: value })}
                >
                  <SelectTrigger className="input-styled">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISH_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={editDishForm.description}
                onChange={(e) => setEditDishForm({ ...editDishForm, description: e.target.value })}
                placeholder="Add a description for this dish..."
                className="input-styled w-full min-h-[80px] resize-none"
                rows={3}
              />
            </div>

            {/* In Stock Toggle */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground text-sm">Availability</p>
                <p className="text-xs text-muted-foreground">
                  {editDishForm.inStock ? "Dish is available for ordering" : "Dish is hidden from menu"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditDishForm({ ...editDishForm, inStock: !editDishForm.inStock })}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  editDishForm.inStock ? "bg-emerald-500" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    editDishForm.inStock ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {savingDish && <Progress value={60} className="h-2" />}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={handleCloseEditDish}
              disabled={savingDish}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditDish}
              disabled={savingDish || !editDishForm.name || !editDishForm.price}
              className="w-full sm:w-auto"
            >
              {savingDish ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
