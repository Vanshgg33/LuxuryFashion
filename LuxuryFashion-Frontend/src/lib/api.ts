// Determine API base URL from environment variable
// VITE_API_BASE must be set in all environments (development and production)
const getApiBase = () => {
  const rawValue = import.meta.env.VITE_API_BASE;
  
  // Debug: Log what we're reading from environment (helpful for troubleshooting)
  console.log('🔍 VITE_API_BASE from env:', rawValue ? `"${rawValue}"` : 'NOT SET');
  
  if (!rawValue) {
    const errorMsg = 
      "❌ CRITICAL: VITE_API_BASE environment variable is not set!\n" +
      "The frontend cannot connect to the backend API.\n\n" +
      "To fix this:\n" +
      "1. Create a .env file in the frontend root directory\n" +
      "2. Add: VITE_API_BASE=http://localhost:8080 (for development)\n" +
      "   Or: VITE_API_BASE=https://your-backend-project.vercel.app (for production)\n" +
      "3. For Vercel deployment:\n" +
      "   - Go to your Vercel project settings\n" +
      "   - Navigate to Environment Variables\n" +
      "   - Add: VITE_API_BASE = https://your-backend-project.vercel.app\n" +
      "   - Make sure it's set for Production, Preview, and Development\n" +
      "   - Redeploy your frontend\n\n" +
      "Without this, all API calls will fail.";
    
    console.error(errorMsg);
    // Return empty string to prevent calls to undefined URL
    // This will cause API calls to fail with clear errors
    return "";
  }
  
  // Trim whitespace
  let apiBase = rawValue.trim();
  
  // Remove trailing slash if present
  apiBase = apiBase.replace(/\/+$/, '');
  
  // Validate that it's an absolute URL (starts with http:// or https://)
  if (!apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
    const errorMsg = 
      `❌ ERROR: VITE_API_BASE must be a full URL starting with http:// or https://\n` +
      `Current value: "${apiBase}"\n` +
      `This looks like a relative path. It should be a full URL like:\n` +
      `  - https://your-backend-project.vercel.app\n` +
      `  - http://localhost:8080\n` +
      `\nPlease check your Vercel environment variables.`;
    console.error(errorMsg);
    return "";
  }
  
  // Log the final API base URL for debugging
  console.log('✅ Using API Base URL:', apiBase);
  
  return apiBase;
};

const API_BASE = getApiBase();

const getStorage = () => (sessionStorage.getItem("rd_use_session") ? sessionStorage : localStorage);
const getToken = () => {
  const storage = getStorage();
  return storage.getItem("rd_access_token");
};
const getRefresh = () => {
  const storage = getStorage();
  return storage.getItem("rd_refresh_token");
};
export const setTokens = (access: string, refresh?: string, persist: boolean = true) => {
  if (!persist) {
    sessionStorage.setItem("rd_use_session", "1");
  } else {
    sessionStorage.removeItem("rd_use_session");
  }
  const storage = persist ? localStorage : sessionStorage;
  if (access) storage.setItem("rd_access_token", access);
  if (refresh) storage.setItem("rd_refresh_token", refresh);
};
export const clearTokens = () => {
  localStorage.removeItem("rd_access_token");
  localStorage.removeItem("rd_refresh_token");
  sessionStorage.removeItem("rd_access_token");
  sessionStorage.removeItem("rd_refresh_token");
  sessionStorage.removeItem("rd_use_session");
};

async function request(path: string, options: RequestInit = {}) {
  if (!API_BASE) {
    const error = new Error(
      "API_BASE is not configured. Please set VITE_API_BASE environment variable in Vercel project settings."
    ) as any;
    error.status = 500;
    error.response = { 
      data: { 
        message: "Backend API URL is not configured. Please contact the administrator." 
      } 
    };
    throw error;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Construct full URL
  const fullUrl = `${API_BASE}${normalizedPath}`;
  
  // Log in development for debugging
  if (import.meta.env.DEV) {
    console.log('🌐 API Request:', fullUrl);
  }
  
  const headers: Record<string, string> = { ...(options.headers as any) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers,
  });
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If response is not JSON, try to get text
      try {
        const txt = await res.text();
        if (txt) errorMessage = txt;
      } catch {
        // Use default error message
      }
    }
    const error: any = new Error(errorMessage);
    error.status = res.status;
    error.response = { data: { message: errorMessage } };
    throw error;
  }
  return res.status === 204 ? null : res.json();
}

const apiGet = (path: string) => request(path, { method: "GET" });
const apiPost = (path: string, body?: any) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
const apiPatch = (path: string, body?: any) =>
  request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
const apiDelete = (path: string) => request(path, { method: "DELETE" });

export { API_BASE, apiGet, apiPost, apiPatch, apiDelete };

export const googleAuthUrl = `${API_BASE}/auth/google`;

// Auth
export const register = (body: { name: string; email: string; password: string; phone?: string }) =>
  apiPost("/auth/register", body);
export const login = (body: { email: string; password: string }) => apiPost("/auth/login", body);
export const refresh = () => apiPost("/auth/refresh", { refreshToken: getRefresh() });
export const forgotPassword = (email: string) => apiPost("/auth/forgot", { email });
export const resetPassword = (email: string, otp: string, password: string) =>
  apiPost("/auth/reset", { email, otp, password });
export const fetchProfile = () => apiGet("/auth/me");

// Catalog
export const fetchProducts = () => apiGet("/dishes");
export const fetchGallery = () => apiGet("/banners");

// Banners (Admin)
export const fetchAdminBanners = () => apiGet("/banners/admin");
export const fetchBannerLimit = () => apiGet("/banners/limit");
export const toggleBannerActive = (id: string) => apiPatch(`/banners/${id}/toggle`, {});
export const deleteBanner = (id: string) => apiDelete(`/banners/${id}`);
export const reorderBanners = (orderedIds: string[]) => apiPost("/banners/reorder", { orderedIds });

// Cart
export const getCart = () => apiGet("/cart");
export const addToCart = (dishId: number | string, quantity = 1) =>
  apiPost("/cart/items", { dishId, quantity });
export const updateCartItem = (itemId: number | string, quantity: number) =>
  apiPatch(`/cart/items/${itemId}`, { quantity });
export const removeFromCart = (itemId: number | string) => apiDelete(`/cart/items/${itemId}`);
export const clearCart = () => apiDelete("/cart");

// Orders
export const placeOrder = (body: any) => apiPost("/orders", body);
export const fetchOrderHistory = () => apiGet("/orders/my");
export const fetchAdminOrders = () => apiGet("/orders/admin");
export const fetchAnalyticsSummary = () => apiGet("/analytics/summary");
export const fetchAnalyticsStatus = () => apiGet("/analytics/status");
export const fetchAnalyticsRevenue = () => apiGet("/analytics/revenue");
export const fetchAnalyticsBestSellers = () => apiGet("/analytics/bestsellers");
export const updateOrderStatus = (id: string, status: string, reason?: string) =>
  apiPatch(`/orders/${id}/status`, { status, ...(reason && { reason }) });
export const fetchUsers = () => apiGet("/users");
export const updateUserRole = (id: string, role: "user" | "admin") => apiPatch(`/users/${id}/role`, { role });
export const updateProfile = (body: { name?: string; phone?: string; address?: Record<string, any> }) => apiPatch("/auth/me", body);

// Coupons
export const validateCoupon = (code: string, subtotal: number) =>
  apiPost("/coupons/validate", { code, subtotal });
export const getCoupon = (code: string) => apiGet(`/coupons/${code}`);
export const createCoupon = (body: any) => apiPost("/coupons", body);
export const getAllCoupons = () => apiGet("/coupons");
export const updateCoupon = (id: string, body: any) => apiPatch(`/coupons/${id}`, body);
export const deleteCoupon = (id: string) => apiDelete(`/coupons/${id}`);

// Settings
export const fetchSettings = () => apiGet("/settings");
export const updateSettings = (body: { lat?: number; lng?: number; address?: string }) =>
  apiPatch("/settings", body);

// Uploads
export const uploadBanner = async (file: File, title?: string) => {
  const form = new FormData();
  form.append("image", file);
  if (title) form.append("title", title);
  return request("/banners", { method: "POST", body: form });
};

export const createDish = async (data: {
  name: string;
  price: number;
  foodCategory?: string;
  dishCategory?: string;
  description?: string;
  inStock?: boolean;
  image?: File;
}) => {
  const form = new FormData();
  form.append("name", data.name);
  form.append("price", String(data.price));
  if (data.foodCategory) form.append("foodCategory", data.foodCategory);
  if (data.dishCategory) form.append("dishCategory", data.dishCategory);
  if (data.description) form.append("description", data.description);
  if (data.inStock !== undefined) form.append("inStock", String(data.inStock));
  if (data.image) form.append("image", data.image);
  return request("/dishes", { method: "POST", body: form });
};

export const updateDish = async (id: string, data: {
  name?: string;
  price?: number;
  foodCategory?: string;
  dishCategory?: string;
  description?: string;
  inStock?: boolean;
  image?: File;
}) => {
  const form = new FormData();
  if (data.name) form.append("name", data.name);
  if (data.price !== undefined) form.append("price", String(data.price));
  if (data.foodCategory) form.append("foodCategory", data.foodCategory);
  if (data.dishCategory) form.append("dishCategory", data.dishCategory);
  if (data.description) form.append("description", data.description);
  if (data.inStock !== undefined) form.append("inStock", String(data.inStock));
  if (data.image) form.append("image", data.image);
  return request(`/dishes/${id}`, { method: "PATCH", body: form });
};

export const deleteDish = (id: string) => apiDelete(`/dishes/${id}`);

// Addresses
export const getAddresses = () => apiGet("/addresses");
export const createAddress = (body: any) => apiPost("/addresses", body);
export const updateAddress = (id: string, body: any) => apiPatch(`/addresses/${id}`, body);
export const deleteAddress = (id: string) => apiDelete(`/addresses/${id}`);
export const setDefaultAddress = (id: string) => apiPatch(`/addresses/${id}/default`, {});

// Favorites
export const getFavorites = () => apiGet("/favorites");
export const addFavorite = (dishId: string) => apiPost(`/favorites/${dishId}`, {});
export const removeFavorite = (dishId: string) => apiDelete(`/favorites/${dishId}`);
export const checkFavorite = (dishId: string) => apiGet(`/favorites/${dishId}/check`);

// Reviews
export const getDishReviews = (dishId: string) => apiGet(`/reviews/dish/${dishId}`);
export const getDishRating = (dishId: string) => apiGet(`/reviews/dish/${dishId}/rating`);
export const createReview = (dishId: string, body: { rating: number; comment?: string }) =>
  apiPost(`/reviews/dish/${dishId}`, body);
export const updateReview = (dishId: string, body: { rating?: number; comment?: string }) =>
  apiPatch(`/reviews/dish/${dishId}`, body);
export const deleteReview = (dishId: string) => apiDelete(`/reviews/dish/${dishId}`);

// Orders
export const getOrder = (id: string) => apiGet(`/orders/${id}`);

// Payments
export const createPaymentOrder = (body: { amount: number; orderId: string }) =>
  apiPost("/payments/create-order", body);
export const verifyPayment = (body: { paymentId: string; orderId: string; signature: string }) =>
  apiPost("/payments/verify", body);
export const getPaymentKey = () => apiPost("/payments/key", {});

// Notifications
export const getNotifications = () => apiGet("/notifications");
export const getUnreadNotifications = () => apiGet("/notifications/unread");
export const getUnreadCount = () => apiGet("/notifications/count");
export const markNotificationRead = (id: string) => apiPatch(`/notifications/${id}/read`, {});
export const markAllNotificationsRead = () => apiPatch("/notifications/read-all", {});
export const deleteNotification = (id: string) => apiDelete(`/notifications/${id}`);
export const clearAllNotifications = () => apiDelete("/notifications");
