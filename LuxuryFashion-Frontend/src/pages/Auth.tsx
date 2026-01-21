import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const AuthPage = () => {
  const { loginUser, registerUser } = useAuth();
  const location = useLocation();
  const locationState = location.state as { from?: string; mode?: "login" | "register" } | null;
  const [mode, setMode] = useState<"login" | "register">(locationState?.mode || "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Update mode when location state changes (e.g., navigating from cart)
  useEffect(() => {
    if (locationState?.mode) {
      setMode(locationState.mode);
    }
  }, [locationState?.mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await loginUser(form.email, form.password, remember);
      } else {
        await registerUser(form.name, form.email, form.password, remember);
      }
      // Redirect to the original page or home
      const redirectTo = locationState?.from || "/";
      navigate(redirectTo);
    } catch (err: any) {
      // Extract error message from API response
      let errorMessage = "An error occurred. Please try again.";
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setForm({ name: "", email: "", password: "" });
    setError(null);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      {/* Background Decorations */}
      <div className="fixed inset-0 gradient-subtle -z-10" />
      <div className="fixed top-0 right-0 w-1/2 h-1/2 gradient-glow -z-10" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-xl">R</span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="card-premium p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to continue to Rangeela Dhaba"
                : "Join us for a delicious experience"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Register only) */}
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5",
                      "bg-secondary border-0 rounded-xl",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring/20",
                      "transition-all duration-300"
                    )}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className={cn(
                    "w-full pl-12 pr-4 py-3.5",
                    "bg-secondary border-0 rounded-xl",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring/20",
                    "transition-all duration-300"
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className={cn(
                    "w-full pl-12 pr-12 py-3.5",
                    "bg-secondary border-0 rounded-xl",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring/20",
                    "transition-all duration-300"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-5 h-5 rounded border-2 transition-all duration-200",
                    remember
                      ? "bg-foreground border-foreground"
                      : "border-border group-hover:border-foreground"
                  )}>
                    {remember && (
                      <svg className="w-full h-full text-background p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Remember me
                </span>
              </label>

              {mode === "login" && (
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "py-4 rounded-xl",
                "bg-foreground text-background",
                "font-semibold text-base",
                "transition-all duration-300",
                "hover:opacity-90 hover:shadow-large",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "group"
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center mt-8 text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-foreground hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

          {/* Terms */}
          <p className="text-center mt-6 text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
