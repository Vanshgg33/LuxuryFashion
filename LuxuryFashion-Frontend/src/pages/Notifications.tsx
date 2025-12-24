import { Bell, Check, Trash2, Package, User, Settings, Tag } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearNotifications, refreshNotifications } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="w-5 h-5 text-primary" />;
      case "user":
        return <User className="w-5 h-5 text-accent" />;
      case "promotion":
        return <Tag className="w-5 h-5 text-green-600" />;
      default:
        return <Settings className="w-5 h-5 text-muted-foreground" />;
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
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Notifications</h1>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-secondary text-sm">
                <Check className="w-4 h-4" />
                Mark all read
              </button>
            )}
            <button onClick={clearNotifications} className="btn-secondary text-sm text-destructive">
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const content = notification.link ? (
              <Link
                to={notification.link}
                onClick={() => markAsRead(notification._id || notification.id || "")}
                className="block"
              >
                <div
                  className={`bg-card rounded-2xl border border-border p-6 hover:bg-secondary/50 transition-colors ${
                    !notification.read ? "ring-2 ring-primary/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-secondary shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`${
                          !notification.read ? "font-semibold text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp || "Recently"}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div
                onClick={() => markAsRead(notification._id || notification.id || "")}
                className={`bg-card rounded-2xl border border-border p-6 cursor-pointer hover:bg-secondary/50 transition-colors ${
                  !notification.read ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`${
                        !notification.read ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp || "Recently"}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
            return <div key={notification._id || notification.id}>{content}</div>;
          })}
        </div>
      )}
    </main>
  );
}






