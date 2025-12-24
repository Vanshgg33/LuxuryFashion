import { Bell, Package, User, Settings, Check, Tag } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-primary" />;
      case "user":
        return <User className="w-4 h-4 text-accent" />;
      case "promotion":
        return <Tag className="w-4 h-4 text-green-600" />;
      default:
        return <Settings className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="relative p-2 rounded-xl hover:bg-secondary transition-colors duration-300"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="w-6 h-6 text-foreground" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in" aria-label={`${unreadCount} unread notifications`}>
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-card border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => {
              const content = (
                <div
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer",
                    !notification.read && "bg-secondary/50"
                  )}
                >
                  <div className="p-2 rounded-lg bg-secondary shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      !notification.read ? "font-medium text-foreground" : "text-muted-foreground"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp || "Recently"}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
                  )}
                </div>
              );

              return notification.link ? (
                <Link
                  key={notification._id || notification.id}
                  to={notification.link}
                  onClick={() => markAsRead(notification._id || notification.id || "")}
                >
                  <DropdownMenuItem className="p-0">
                    {content}
                  </DropdownMenuItem>
                </Link>
              ) : (
                <DropdownMenuItem
                  key={notification._id || notification.id}
                  onClick={() => markAsRead(notification._id || notification.id || "")}
                  className="p-0"
                >
                  {content}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="px-4 py-2">
          <Link
            to="/notifications"
            className="text-sm text-primary hover:underline text-center block"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
