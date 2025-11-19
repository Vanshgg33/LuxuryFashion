import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3,
  Package,
  Users,
  ShoppingBag,
  Image,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Bell,
} from "lucide-react";
import { validateToken } from "../../api/LoginRegisterApi";
import { fetchOrdersApi } from "../../api/AdminApi";

interface NotificationProps {
  type: "success" | "error";
  message: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationProps | null>(
    null
  );

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return { notification, showNotification };
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const { notification, showNotification } = useNotification();

  // 🔒 Auth check inside component
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await validateToken();
        console.log("Validation response:", result);
        setLoading(false);
      } catch (err) {
        console.error("Validation failed:", err);
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  // Check for new orders
  useEffect(() => {
    const checkNewOrders = async () => {
      try {
        const orders = await fetchOrdersApi();
        const today = new Date().toDateString();
        const todayOrders = orders.filter(order => 
          new Date(order.orderDate).toDateString() === today
        );
        
        if (todayOrders.length > 0) {
          setNewOrdersCount(todayOrders.length);
          setShowNewOrderAlert(true);
        }
      } catch (error) {
        console.error('Error checking new orders:', error);
      }
    };

    if (!loading) {
      checkNewOrders();
    }
  }, [loading]);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/admin" },
    { id: "products", label: "Products", icon: Package, path: "/admin/products" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "orders", label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
    { id: "gallery", label: "Gallery", icon: Image, path: "/admin/gallery" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, path: "/admin/analytics" },
    { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const isActiveRoute = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fonts are already imported globally in index.css */}
      <style>{`
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* New Order Alert */}
      {showNewOrderAlert && (
        <div className="fixed top-20 right-4 z-50 bg-blue-100 border border-blue-300 text-blue-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5" />
            <div>
              <div className="font-medium">New Orders Today!</div>
              <div className="text-sm">{newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''} received</div>
            </div>
            <button
              onClick={() => setShowNewOrderAlert(false)}
              className="ml-4 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-serif font-medium text-black tracking-widest">
              LUXURY FASHION
              <span className="text-sm font-sans font-normal text-gray-500 ml-2">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Welcome back, Admin</div>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left font-medium text-sm transition-colors duration-200 ${
                    isActiveRoute(item.path)
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet context={{ showNotification }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
