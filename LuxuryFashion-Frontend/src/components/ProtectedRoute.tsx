import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      
    }
  }, [loading, user]);

  if (loading) return null;
  if (!user)
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 space-y-3">
          <div className="flex justify-center">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Login required</h1>
          <p className="text-muted-foreground">Please sign in to continue.</p>
          <a className="btn-primary inline-flex items-center justify-center gap-2" href="/auth">
            Go to Login
          </a>
        </div>
      </main>
    );
  return children;
};

export default ProtectedRoute;

