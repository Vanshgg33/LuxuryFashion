import { User, Mail, Phone, MapPin, CreditCard, Bell, LogOut, ChevronRight, Package, Heart, Settings, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartContext } from "@/contexts/CartContext";

const Profile = () => {
  const { orders } = useCartContext();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Package, label: "My Orders", path: "/orders", count: orders.length },
    { icon: Heart, label: "Favorites", path: "#", count: 5 },
    { icon: MapPin, label: "Saved Addresses", path: "#", count: 2 },
    { icon: CreditCard, label: "Payment Methods", path: "#", count: 1 },
    { icon: Bell, label: "Notifications", path: "#" },
    { icon: Settings, label: "Settings", path: "#" },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-card rounded-3xl border border-border p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-olive flex items-center justify-center">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-display font-bold text-foreground mb-1">
              John Doe
            </h1>
            <p className="text-muted-foreground mb-4">Premium Member</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                john.doe@email.com
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                +91 98765 43210
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <button className="btn-outline">Edit Profile</button>
            <button
              onClick={() => navigate("/admin")}
              className="btn-primary flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admin Dashboard
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">₹{orders.reduce((sum, o) => sum + o.total, 0)}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">150</p>
            <p className="text-sm text-muted-foreground">Reward Points</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors duration-300 border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-secondary">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.count !== undefined && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <button className="w-full mt-6 flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive rounded-2xl font-medium hover:bg-destructive/20 transition-colors duration-300">
        <LogOut className="w-5 h-5" />
        Log Out
      </button>

      {/* Recent Orders Preview */}
      {orders.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Recent Orders
            </h2>
            <Link
              to="/orders"
              className="text-primary font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={order.items[0]?.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} items • {order.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₹{order.total}</p>
                  <p className="text-sm text-primary">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Profile;
