import { Users, ShoppingBag, DollarSign, TrendingUp, Eye, EyeOff, Trash2, Image, Pencil, X, Check, Package, Plus, Upload, Truck, Clock, Power, Search } from "lucide-react";
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
  toggleDelivery,
  updateDeliveryFee,
  updateOperatingHours,
  toggleRestaurantOpen,
  updateCategoryTimeRestrictions,
  fetchAdminBanners,
  fetchBannerLimit,
  toggleBannerActive,
  deleteBanner,
  fetchProducts,
  updateCategoryStock,
} from "@/lib/api";
import { MapPicker } from "@/components/MapPicker";
import { useState, useMemo, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { compressImageForUpload } from "@/lib/imageUtils";
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
import { toast } from "sonner";

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
    hasTimeRestriction: false,
    availableFrom: "",
    availableTo: "",
    hasHalfPortion: false,
    halfPortionPrice: "",
    isBuyOneGetOne: false,
  });
  const [settingsForm, setSettingsForm] = useState<{ lat?: number; lng?: number; address?: string; isDeliveryEnabled?: boolean; deliveryFee?: number; openingTime?: string; closingTime?: string; isOpen?: boolean; closureReason?: string }>({});
  const [isTogglingDelivery, setIsTogglingDelivery] = useState(false);
  const [isSavingDeliveryFee, setIsSavingDeliveryFee] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isTogglingRestaurant, setIsTogglingRestaurant] = useState(false);
  const [showClosureReason, setShowClosureReason] = useState(false);
  const [tempClosureReason, setTempClosureReason] = useState('');
  const [categoryRestrictions, setCategoryRestrictions] = useState<Record<string, { availableFrom: string; availableTo: string; isEnabled: boolean }>>({});
  const [isSavingCategoryRestrictions, setIsSavingCategoryRestrictions] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingDish, setUploadingDish] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [dishPreview, setDishPreview] = useState<string | null>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerLimit, setBannerLimit] = useState<{ current: number; max: number; canAdd: boolean } | null>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [dishSearchQuery, setDishSearchQuery] = useState('');
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [editDishForm, setEditDishForm] = useState<{
    name: string;
    price: string;
    foodCategory: string;
    dishCategory: string;
    description: string;
    inStock: boolean;
    image: File | null;
    hasTimeRestriction: boolean;
    availableFrom: string;
    availableTo: string;
    hasHalfPortion: boolean;
    halfPortionPrice: string;
  }>({ name: "", price: "", foodCategory: "", dishCategory: "", description: "", inStock: true, image: null, hasTimeRestriction: false, availableFrom: "", availableTo: "", hasHalfPortion: false, halfPortionPrice: "" });
  const [editDishPreview, setEditDishPreview] = useState<string | null>(null);
  const [savingDish, setSavingDish] = useState(false);
  const [compressingImage, setCompressingImage] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);

  // Filter dishes based on search query
  const filteredDishes = useMemo(() => {
    if (!dishSearchQuery.trim()) return dishes;
    const query = dishSearchQuery.toLowerCase().trim();
    return dishes.filter(dish =>
      dish.name?.toLowerCase().includes(query) ||
      dish.description?.toLowerCase().includes(query) ||
      dish.foodCategory?.toLowerCase().includes(query) ||
      dish.dishCategory?.toLowerCase().includes(query)
    );
  }, [dishes, dishSearchQuery]);

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
        isDeliveryEnabled: settingsRes?.isDeliveryEnabled ?? true,
        deliveryFee: settingsRes?.deliveryFee ?? 40,
        openingTime: settingsRes?.openingTime ?? '09:00',
        closingTime: settingsRes?.closingTime ?? '22:00',
        isOpen: settingsRes?.isOpen ?? true,
        closureReason: settingsRes?.closureReason ?? '',
      });
      setCategoryRestrictions(settingsRes?.categoryTimeRestrictions || {});
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
        hasTimeRestriction: dishForm.hasTimeRestriction,
        availableFrom: dishForm.hasTimeRestriction ? dishForm.availableFrom : undefined,
        availableTo: dishForm.hasTimeRestriction ? dishForm.availableTo : undefined,
        hasHalfPortion: dishForm.hasHalfPortion,
        halfPortionPrice: dishForm.hasHalfPortion && dishForm.halfPortionPrice ? parseFloat(dishForm.halfPortionPrice) : undefined,
        isBuyOneGetOne: dishForm.isBuyOneGetOne,
      });
      setDishForm({ name: "", price: "", foodCategory: "", dishCategory: "", description: "", inStock: true, image: null, hasTimeRestriction: false, availableFrom: "", availableTo: "", hasHalfPortion: false, halfPortionPrice: "", isBuyOneGetOne: false });
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
      hasTimeRestriction: dish.hasTimeRestriction || false,
      availableFrom: dish.availableFrom || "",
      availableTo: dish.availableTo || "",
      hasHalfPortion: dish.hasHalfPortion || false,
      halfPortionPrice: dish.halfPortionPrice ? String(dish.halfPortionPrice) : "",
      isBuyOneGetOne: dish.isBuyOneGetOne || false,
    });
    setEditDishPreview(dish.imageUrl || null);
  };

  const handleCloseEditDish = () => {
    setEditingDish(null);
    setEditDishForm({ name: "", price: "", foodCategory: "", dishCategory: "", description: "", inStock: true, image: null, hasTimeRestriction: false, availableFrom: "", availableTo: "", hasHalfPortion: false, halfPortionPrice: "" });
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
        hasTimeRestriction: editDishForm.hasTimeRestriction,
        availableFrom: editDishForm.hasTimeRestriction ? editDishForm.availableFrom : undefined,
        availableTo: editDishForm.hasTimeRestriction ? editDishForm.availableTo : undefined,
        hasHalfPortion: editDishForm.hasHalfPortion,
        halfPortionPrice: editDishForm.hasHalfPortion && editDishForm.halfPortionPrice ? parseFloat(editDishForm.halfPortionPrice) : undefined,
        isBuyOneGetOne: editDishForm.isBuyOneGetOne,
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

  // Get category stock status from dishes
  const categoryStockStatus = useMemo(() => {
    const status: Record<string, { total: number; inStock: number; allInStock: boolean }> = {};
    dishes.forEach((dish) => {
      const category = dish.dishCategory || 'Uncategorized';
      if (!status[category]) {
        status[category] = { total: 0, inStock: 0, allInStock: true };
      }
      status[category].total++;
      if (dish.inStock) {
        status[category].inStock++;
      }
    });
    // Calculate allInStock after counting
    Object.keys(status).forEach((cat) => {
      status[cat].allInStock = status[cat].inStock === status[cat].total;
    });
    return status;
  }, [dishes]);

  const [togglingCategory, setTogglingCategory] = useState<string | null>(null);

  const handleToggleCategoryStock = async (category: string, currentlyInStock: boolean) => {
    setTogglingCategory(category);
    try {
      const newStockStatus = !currentlyInStock;
      await updateCategoryStock(category, newStockStatus);
      // Update local dishes state
      setDishes((prev) =>
        prev.map((d) =>
          d.dishCategory === category ? { ...d, inStock: newStockStatus } : d
        )
      );
      toast.success(`${category}: All items ${newStockStatus ? 'in stock' : 'out of stock'}`);
    } catch (err: any) {
      console.error("Failed to update category stock:", err);
      toast.error(err.message || "Failed to update category stock");
    } finally {
      setTogglingCategory(null);
    }
  };

  const handleSettingsSave = async () => {
    try {
      if (!settingsForm.lat || !settingsForm.lng) {
        toast.error("Please set the restaurant location on the map");
        return;
      }

      await updateSettings({
        lat: settingsForm.lat,
        lng: settingsForm.lng,
        address: settingsForm.address,
      });
      toast.success("Restaurant location updated successfully");
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      toast.error(err.message || "Failed to save restaurant location");
    }
  };

  const handleToggleDelivery = async () => {
    setIsTogglingDelivery(true);
    try {
      const newValue = !settingsForm.isDeliveryEnabled;
      await toggleDelivery(newValue);
      setSettingsForm({ ...settingsForm, isDeliveryEnabled: newValue });
      toast.success(newValue ? "Delivery enabled" : "Delivery disabled - only takeaway orders will be accepted");
    } catch (err: any) {
      console.error("Failed to toggle delivery:", err);
      toast.error(err.message || "Failed to update delivery status");
    } finally {
      setIsTogglingDelivery(false);
    }
  };

  const handleSaveDeliveryFee = async () => {
    if (settingsForm.deliveryFee === undefined || settingsForm.deliveryFee < 0) {
      toast.error("Please enter a valid delivery fee");
      return;
    }
    setIsSavingDeliveryFee(true);
    try {
      await updateDeliveryFee(settingsForm.deliveryFee);
      toast.success(`Delivery fee updated to ₹${settingsForm.deliveryFee}`);
    } catch (err: any) {
      console.error("Failed to update delivery fee:", err);
      toast.error(err.message || "Failed to update delivery fee");
    } finally {
      setIsSavingDeliveryFee(false);
    }
  };

  const handleSaveOperatingHours = async () => {
    if (!settingsForm.openingTime || !settingsForm.closingTime) {
      toast.error("Please set both opening and closing times");
      return;
    }
    setIsSavingHours(true);
    try {
      await updateOperatingHours(settingsForm.openingTime, settingsForm.closingTime);
      toast.success(`Operating hours updated: ${settingsForm.openingTime} - ${settingsForm.closingTime}`);
    } catch (err: any) {
      console.error("Failed to update operating hours:", err);
      toast.error(err.message || "Failed to update operating hours");
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleToggleRestaurant = async (turnOn: boolean) => {
    if (!turnOn && !showClosureReason) {
      // Show closure reason input first
      setShowClosureReason(true);
      return;
    }

    setIsTogglingRestaurant(true);
    try {
      await toggleRestaurantOpen(turnOn, turnOn ? '' : tempClosureReason);
      setSettingsForm({ ...settingsForm, isOpen: turnOn, closureReason: turnOn ? '' : tempClosureReason });
      setShowClosureReason(false);
      setTempClosureReason('');
      toast.success(turnOn ? "Restaurant is now OPEN for orders!" : "Restaurant is now CLOSED. No orders will be accepted.");
    } catch (err: any) {
      console.error("Failed to toggle restaurant:", err);
      toast.error(err.message || "Failed to update restaurant status");
    } finally {
      setIsTogglingRestaurant(false);
    }
  };

  const handleSaveCategoryRestrictions = async () => {
    setIsSavingCategoryRestrictions(true);
    try {
      await updateCategoryTimeRestrictions(categoryRestrictions);
      toast.success("Category time restrictions saved");
      await loadData(); // Reload dishes with updated availability
    } catch (err: any) {
      console.error("Failed to save category restrictions:", err);
      toast.error(err.message || "Failed to save category restrictions");
    } finally {
      setIsSavingCategoryRestrictions(false);
    }
  };

  const updateCategoryRestriction = (category: string, field: string, value: any) => {
    setCategoryRestrictions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        availableFrom: prev[category]?.availableFrom || '09:00',
        availableTo: prev[category]?.availableTo || '22:00',
        isEnabled: prev[category]?.isEnabled || false,
        [field]: value,
      }
    }));
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

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={dishSearchQuery}
              onChange={(e) => setDishSearchQuery(e.target.value)}
              className="input-styled w-full pl-9 text-sm"
            />
            {dishSearchQuery && (
              <button
                onClick={() => setDishSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-secondary rounded"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Search Results Count */}
          {dishSearchQuery && (
            <p className="text-xs text-muted-foreground">
              Found {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'}
            </p>
          )}

          {/* Category Stock Toggles */}
          {Object.keys(categoryStockStatus).length > 0 && (
            <div className="p-2 bg-secondary/50 rounded-lg">
              <p className="text-xs font-medium text-foreground mb-2">Category Stock</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(categoryStockStatus).map(([category, status]) => (
                  <button
                    key={category}
                    onClick={() => handleToggleCategoryStock(category, status.allInStock)}
                    disabled={togglingCategory === category}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1",
                      status.allInStock
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200",
                      togglingCategory === category && "opacity-50"
                    )}
                  >
                    {status.allInStock ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    {category}
                    <span className="text-[10px] opacity-70">({status.inStock}/{status.total})</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Click to toggle all items in a category</p>
            </div>
          )}

          {/* Existing Dishes */}
          {filteredDishes.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredDishes.map((dish) => (
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

          {filteredDishes.length === 0 && !showAddDish && (
            <div className="text-center py-4 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {dishSearchQuery ? `No dishes found for "${dishSearchQuery}"` : "No dishes added yet"}
              </p>
              {dishSearchQuery && (
                <button
                  onClick={() => setDishSearchQuery('')}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Clear search
                </button>
              )}
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

              {/* Half Portion Toggle */}
              <div className="p-3 bg-secondary/50 rounded-lg space-y-2 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Half Portion Available</span>
                  <button
                    type="button"
                    onClick={() => setDishForm({ ...dishForm, hasHalfPortion: !dishForm.hasHalfPortion })}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors",
                      dishForm.hasHalfPortion ? "bg-primary" : "bg-gray-300"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      dishForm.hasHalfPortion ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
                {dishForm.hasHalfPortion && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Half Portion Price</label>
                    <input
                      type="number"
                      placeholder="Half portion price"
                      value={dishForm.halfPortionPrice}
                      onChange={(e) => setDishForm({ ...dishForm, halfPortionPrice: e.target.value })}
                      className="input-styled w-full text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              {/* Time Restriction for Add Dish */}
              <div className="p-2 bg-secondary/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time Restriction
                  </span>
                  <button
                    type="button"
                    onClick={() => setDishForm({ ...dishForm, hasTimeRestriction: !dishForm.hasTimeRestriction })}
                    className={cn(
                      "relative w-9 h-5 rounded-full transition-colors",
                      dishForm.hasTimeRestriction ? "bg-primary" : "bg-gray-300"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      dishForm.hasTimeRestriction ? "translate-x-4" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
                {dishForm.hasTimeRestriction && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-0.5 block">From</label>
                      <input
                        type="time"
                        value={dishForm.availableFrom}
                        onChange={(e) => setDishForm({ ...dishForm, availableFrom: e.target.value })}
                        className="input-styled w-full text-xs py-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-0.5 block">Until</label>
                      <input
                        type="time"
                        value={dishForm.availableTo}
                        onChange={(e) => setDishForm({ ...dishForm, availableTo: e.target.value })}
                        className="input-styled w-full text-xs py-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Buy 1 Get 1 Free Toggle */}
              <div className="p-3 bg-secondary/50 rounded-lg space-y-2 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" /> Buy 1 Get 1 Free
                  </span>
                  <button
                    type="button"
                    onClick={() => setDishForm({ ...dishForm, isBuyOneGetOne: !dishForm.isBuyOneGetOne })}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors",
                      dishForm.isBuyOneGetOne ? "bg-primary" : "bg-gray-300"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform",
                      dishForm.isBuyOneGetOne ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
                {dishForm.isBuyOneGetOne && (
                  <p className="text-xs text-muted-foreground mt-1">
                    When enabled, customers will get 2 items for the price of 1
                  </p>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    setCompressingImage(true);
                    try {
                      // Automatically compress image to under 4MB
                      const compressedFile = await compressImageForUpload(file);
                      setDishForm({ ...dishForm, image: compressedFile });
                      setDishPreview(URL.createObjectURL(compressedFile));
                      if (file.size > 4 * 1024 * 1024) {
                        toast.success(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                      }
                    } catch (error) {
                      console.error("Image compression failed:", error);
                      toast.error("Failed to process image. Please try a different image.");
                    } finally {
                      setCompressingImage(false);
                    }
                  } else {
                    setDishForm({ ...dishForm, image: null });
                    setDishPreview(null);
                  }
                }}
              />
              {dishPreview && (
                <div className="rounded-xl overflow-hidden border border-border">
                  <img src={dishPreview} alt="preview" className="w-full h-24 object-cover" />
                </div>
              )}
              {compressingImage && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Progress value={50} className="h-1 flex-1" />
                  <span>Compressing image...</span>
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
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Restaurant Settings</h3>

          {/* Restaurant Open/Close Toggle */}
          <div className={cn(
            "p-3 rounded-xl border-2 transition-all",
            settingsForm.isOpen
              ? "border-emerald-300 bg-emerald-50/50"
              : "border-red-300 bg-red-50/50"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  settingsForm.isOpen ? "bg-emerald-100" : "bg-red-100"
                )}>
                  <Power className={cn(
                    "w-5 h-5",
                    settingsForm.isOpen ? "text-emerald-600" : "text-red-600"
                  )} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Restaurant {settingsForm.isOpen ? "OPEN" : "CLOSED"}
                  </p>
                  <p className={cn(
                    "text-xs",
                    settingsForm.isOpen ? "text-emerald-600" : "text-red-600"
                  )}>
                    {settingsForm.isOpen ? "Accepting orders" : settingsForm.closureReason || "Not accepting orders"}
                  </p>
                </div>
              </div>
              {!showClosureReason && (
                <button
                  onClick={() => handleToggleRestaurant(!settingsForm.isOpen)}
                  disabled={isTogglingRestaurant}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50",
                    settingsForm.isOpen
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  )}
                >
                  {isTogglingRestaurant ? "..." : settingsForm.isOpen ? "Close Restaurant" : "Open Restaurant"}
                </button>
              )}
            </div>

            {/* Closure Reason Input */}
            {showClosureReason && (
              <div className="mt-3 pt-3 border-t border-red-200 space-y-2">
                <p className="text-sm font-medium text-red-700">Why are you closing?</p>
                <input
                  type="text"
                  placeholder="e.g., Festival holiday, Maintenance, etc. (optional)"
                  value={tempClosureReason}
                  onChange={(e) => setTempClosureReason(e.target.value)}
                  className="input-styled w-full text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRestaurant(false)}
                    disabled={isTogglingRestaurant}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isTogglingRestaurant ? "Closing..." : "Confirm Close"}
                  </button>
                  <button
                    onClick={() => {
                      setShowClosureReason(false);
                      setTempClosureReason('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Operating Hours */}
          <div className="p-3 rounded-xl border border-border bg-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Operating Hours</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Opening Time</label>
                <input
                  type="time"
                  value={settingsForm.openingTime ?? '09:00'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, openingTime: e.target.value })}
                  className="input-styled w-full text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Closing Time</label>
                <input
                  type="time"
                  value={settingsForm.closingTime ?? '22:00'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, closingTime: e.target.value })}
                  className="input-styled w-full text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleSaveOperatingHours}
              disabled={isSavingHours}
              className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSavingHours ? "Saving..." : "Save Hours"}
            </button>
            <p className="text-xs text-muted-foreground mt-1.5">
              Orders can only be placed during these hours
            </p>
          </div>

          {/* Category Time Restrictions */}
          <div className="p-3 rounded-xl border border-border bg-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Category Time Restrictions</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Set specific hours when each category is available
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {DISH_CATEGORY_OPTIONS.map((category) => {
                const restriction = categoryRestrictions[category.value] || { availableFrom: '09:00', availableTo: '22:00', isEnabled: false };
                return (
                  <div key={category.value} className={cn(
                    "p-2 rounded-lg border transition-all",
                    restriction.isEnabled ? "border-primary/50 bg-primary/5" : "border-border"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{category.label}</span>
                      <button
                        type="button"
                        onClick={() => updateCategoryRestriction(category.value, 'isEnabled', !restriction.isEnabled)}
                        className={cn(
                          "relative w-9 h-5 rounded-full transition-colors",
                          restriction.isEnabled ? "bg-primary" : "bg-gray-300"
                        )}
                      >
                        <span className={cn(
                          "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                          restriction.isEnabled ? "translate-x-4" : "translate-x-0.5"
                        )} />
                      </button>
                    </div>
                    {restriction.isEnabled && (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="time"
                          value={restriction.availableFrom}
                          onChange={(e) => updateCategoryRestriction(category.value, 'availableFrom', e.target.value)}
                          className="input-styled text-xs py-1 flex-1"
                        />
                        <span className="text-xs text-muted-foreground self-center">to</span>
                        <input
                          type="time"
                          value={restriction.availableTo}
                          onChange={(e) => updateCategoryRestriction(category.value, 'availableTo', e.target.value)}
                          className="input-styled text-xs py-1 flex-1"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleSaveCategoryRestrictions}
              disabled={isSavingCategoryRestrictions}
              className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSavingCategoryRestrictions ? "Saving..." : "Save Category Restrictions"}
            </button>
          </div>

          {/* Delivery Toggle */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-xl border transition-all",
            settingsForm.isDeliveryEnabled
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-amber-200 bg-amber-50/50"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                settingsForm.isDeliveryEnabled ? "bg-emerald-100" : "bg-amber-100"
              )}>
                <Truck className={cn(
                  "w-5 h-5",
                  settingsForm.isDeliveryEnabled ? "text-emerald-600" : "text-amber-600"
                )} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Delivery Service</p>
                <p className={cn(
                  "text-xs",
                  settingsForm.isDeliveryEnabled ? "text-emerald-600" : "text-amber-600"
                )}>
                  {settingsForm.isDeliveryEnabled ? "Accepting delivery orders" : "Takeaway only"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleDelivery}
              disabled={isTogglingDelivery}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors disabled:opacity-50",
                settingsForm.isDeliveryEnabled ? "bg-emerald-500" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  settingsForm.isDeliveryEnabled ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {!settingsForm.isDeliveryEnabled && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
              Delivery is currently disabled. All orders will be processed as takeaway.
            </p>
          )}

          {/* Delivery Fee Setting */}
          {settingsForm.isDeliveryEnabled && (
            <div className="p-3 rounded-xl border border-border bg-secondary/30">
              <p className="text-sm font-medium text-foreground mb-2">Delivery Fee</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={settingsForm.deliveryFee ?? 40}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: parseFloat(e.target.value) || 0 })}
                    className="input-styled pl-7 w-full"
                    placeholder="40"
                  />
                </div>
                <button
                  onClick={handleSaveDeliveryFee}
                  disabled={isSavingDeliveryFee}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSavingDeliveryFee ? "..." : "Save"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                This fee will be applied to all delivery orders
              </p>
            </div>
          )}

          <div className="border-t border-border pt-3 mt-3">
            <p className="text-sm font-medium text-foreground mb-3">Restaurant Location</p>
            <input
              type="number"
              placeholder="Latitude"
              value={settingsForm.lat ?? ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, lat: parseFloat(e.target.value) })}
              className="input-styled"
            />
          </div>
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
            Save Location
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
                      PNG, JPG - Auto-compressed to 4MB
                    </p>
                  </div>
                )}
                <input
                  id="edit-dish-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCompressingImage(true);
                      try {
                        // Automatically compress image to under 4MB
                        const compressedFile = await compressImageForUpload(file);
                        setEditDishForm({ ...editDishForm, image: compressedFile });
                        setEditDishPreview(URL.createObjectURL(compressedFile));
                        if (file.size > 4 * 1024 * 1024) {
                          toast.success(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                        }
                      } catch (error) {
                        console.error("Image compression failed:", error);
                        toast.error("Failed to process image. Please try a different image.");
                      } finally {
                        setCompressingImage(false);
                      }
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

            {/* Time Restriction */}
            <div className="p-3 bg-secondary/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Time Restriction
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Make this dish available only during specific hours
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditDishForm({ ...editDishForm, hasTimeRestriction: !editDishForm.hasTimeRestriction })}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    editDishForm.hasTimeRestriction ? "bg-primary" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      editDishForm.hasTimeRestriction ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {editDishForm.hasTimeRestriction && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Available From</label>
                    <input
                      type="time"
                      value={editDishForm.availableFrom}
                      onChange={(e) => setEditDishForm({ ...editDishForm, availableFrom: e.target.value })}
                      className="input-styled w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Available Until</label>
                    <input
                      type="time"
                      value={editDishForm.availableTo}
                      onChange={(e) => setEditDishForm({ ...editDishForm, availableTo: e.target.value })}
                      className="input-styled w-full text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Buy 1 Get 1 Free Toggle */}
            <div className="p-3 bg-secondary/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                    <Package className="w-4 h-4" /> Buy 1 Get 1 Free
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Customers will get 2 items for the price of 1
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditDishForm({ ...editDishForm, isBuyOneGetOne: !editDishForm.isBuyOneGetOne })}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    editDishForm.isBuyOneGetOne ? "bg-primary" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      editDishForm.isBuyOneGetOne ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Half Portion Toggle */}
            <div className="p-3 bg-secondary/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">Half Portion Available</p>
                  <p className="text-xs text-muted-foreground">
                    Allow customers to order half portions at a different price
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditDishForm({ ...editDishForm, hasHalfPortion: !editDishForm.hasHalfPortion })}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    editDishForm.hasHalfPortion ? "bg-primary" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      editDishForm.hasHalfPortion ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
              {editDishForm.hasHalfPortion && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Half Portion Price (₹)</label>
                  <input
                    type="number"
                    value={editDishForm.halfPortionPrice}
                    onChange={(e) => setEditDishForm({ ...editDishForm, halfPortionPrice: e.target.value })}
                    placeholder="Half portion price"
                    className="input-styled w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
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
