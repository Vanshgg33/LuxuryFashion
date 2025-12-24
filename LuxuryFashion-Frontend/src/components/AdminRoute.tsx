import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { ShieldOff } from "lucide-react";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      
    }
  }, [loading, user]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin")
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 space-y-3">
          <div className="flex justify-center">
            <ShieldOff className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Access denied</h1>
          <p className="text-muted-foreground">Admin privileges are required to view this page.</p>
          <a className="btn-primary inline-flex items-center justify-center gap-2" href="/">
            Go Home
          </a>
        </div>
      </main>
    );
  return children;
};

export default AdminRoute;

