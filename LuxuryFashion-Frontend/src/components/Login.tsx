import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Shield, X, Menu, User, ShoppingBag, Search } from "lucide-react";
import { loginUser } from "../api/LoginRegisterApi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { OAUTH_LOGIN_URL } from '../api/base';
import { logger } from '../utils/logger';
import type { AxiosError } from 'axios';

type ContactMethod = "email" | "phone";

interface FormData {
  email: string;
  phone: string;
  password: string;
  remember: boolean;
}

const ElegantLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    password: "",
    remember: false,
  });

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setInitialLoad(false), 100);
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const toggleContactMethod = (method: ContactMethod) => {
    setContactMethod(method);
    if (method === "email") {
      setFormData((prev) => ({ ...prev, phone: "" }));
    } else {
      setFormData((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loginInput = contactMethod === "email" ? formData.email.trim() : formData.phone.trim();
    if (!loginInput || !formData.password) {
      setError("Please fill in all required fields");
      triggerShake();
      setLoading(false);
      return;
    }

    try {
      let response;
      if (contactMethod === "email") {
        response = await loginUser({ email: formData.email, password: formData.password });
      }
      
      if (response && response.token) {
        login(response.token, response.user || {
          id: response.userId || '1',
          email: formData.email,
          firstName: response.firstName || 'User',
          lastName: response.lastName || ''
        });
        navigate('/');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      logger.error("Error during login", axiosError);
      setError("Login failed. Please check your credentials.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Password reset functionality would be implemented here");
  };

  const handleGoogleLogin = () => {
    window.location.href = OAUTH_LOGIN_URL;
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
        @keyframes gentle-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-gentle-shake {
          animation: gentle-shake 0.5s ease-in-out;
        }
      `}</style>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-40 border-b border-gray-100 transition-all duration-300">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl md:text-3xl font-serif font-medium text-black tracking-widest hover:scale-105 transition-transform duration-300 cursor-pointer">
              ÉLÉGANCE
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-700 hover:text-black">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-700 hover:text-black hidden md:block">
                <User className="w-5 h-5" />
              </button>
              <button className="relative p-2 text-gray-700 hover:text-black">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center">0</span>
              </button>
              <button 
                className="lg:hidden p-2 text-gray-700 hover:text-black"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 lg:hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="text-2xl font-serif font-medium text-black tracking-widest">
                ÉLÉGANCE
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-700 hover:text-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col space-y-8 p-6">
              {['Women', 'Men', 'Accessories', 'New Arrivals', 'Sale'].map((item) => (
                <a key={item} href="#" className="text-2xl font-serif text-gray-700 hover:text-black">
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200 py-4 sm:py-8 px-2 sm:px-4">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-4rem)] shadow-xl sm:shadow-2xl rounded-lg sm:rounded-2xl overflow-hidden">
          {/* Left Side - Hero */}
          <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Fashion Model"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white z-10">
              <div className="text-center space-y-6 animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">ÉLÉGANCE</h2>
                <div className="w-24 h-1 bg-white/30 mx-auto"></div>
                <p className="text-lg md:text-xl font-light text-gray-200 max-w-md">
                  Discover luxury fashion that defines your style
                </p>
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Premium Quality</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-16 bg-white dark:bg-gray-800 order-1 lg:order-2 transition-colors duration-200 w-full relative overflow-hidden min-h-[calc(100vh-4rem)] sm:min-h-auto">
            {/* Decorative Background Elements - Hidden on mobile for better performance */}
            <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-700/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="hidden sm:block absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-gray-100 to-transparent dark:from-gray-700/30 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div
              ref={formRef}
              className={`w-full max-w-md relative z-10 transition-all duration-800 ${
                initialLoad ? "translate-y-10 opacity-0" : "translate-y-0 opacity-100"
              } ${shake ? "animate-gentle-shake" : ""}`}
            >
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <div className="inline-block mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-lg">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white dark:text-black" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-black dark:text-white mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"></div>
                <p className="text-gray-600 dark:text-gray-400 font-light text-sm sm:text-base md:text-lg px-2">Sign in to continue your journey</p>
              </div>

              {error && (
                <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 border-l-4 border-red-500 dark:border-red-400 rounded-lg shadow-md flex items-start sm:items-center space-x-2 sm:space-x-3 animate-slide-down">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400" />
                  </div>
                  <span className="text-red-700 dark:text-red-300 font-medium text-xs sm:text-sm flex-1">{error}</span>
                </div>
              )}

              {/* Contact Method Toggle */}
              <div className="flex mb-6 sm:mb-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleContactMethod("email")}
                  className={`flex-1 py-3 sm:py-4 transition-all duration-300 font-medium text-sm sm:text-base ${
                    contactMethod === "email" 
                      ? "bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black shadow-lg scale-[1.02]" 
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => toggleContactMethod("phone")}
                  className={`flex-1 py-3 sm:py-4 transition-all duration-300 font-medium text-sm sm:text-base ${
                    contactMethod === "phone" 
                      ? "bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black shadow-lg scale-[1.02]" 
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  Phone
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 md:space-y-8">
                <div className="space-y-2">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2"> 
                    {contactMethod === "email" ? "Email Address" : "Phone Number"}
                  </label>
                  <div className="relative">
                    <input
                      type={contactMethod === "email" ? "email" : "tel"}
                      name={contactMethod}
                      value={contactMethod === "email" ? formData.email : formData.phone}
                      onChange={handleInputChange}
                      placeholder={contactMethod === "email" ? "your@email.com" : "+1 (555) 123-456"}
                      className="w-full px-4 py-4 sm:py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-300 bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 touch-manipulation shadow-sm hover:shadow-md focus:shadow-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full px-4 py-4 sm:py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-300 bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-12 shadow-sm hover:shadow-md focus:shadow-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors touch-manipulation rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-4 gap-3 sm:gap-0">
                  <label className="flex items-center cursor-pointer touch-manipulation min-h-[44px]">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleInputChange}
                      className="mr-2 w-5 h-5 sm:w-5 sm:h-5 cursor-pointer"
                    />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Remember me</span>
                  </label>
                  <button type="button" onClick={handleForgotPassword} className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-left sm:text-right touch-manipulation min-h-[44px] flex items-center">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-black via-gray-800 to-black dark:from-white dark:via-gray-200 dark:to-white text-white dark:text-black hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 dark:hover:from-gray-200 dark:hover:via-gray-100 dark:hover:to-gray-200 active:scale-[0.98] transition-all duration-300 text-base sm:text-lg font-bold touch-manipulation rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] min-h-[52px]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Sign In</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 flex items-center justify-center space-x-3 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md font-medium text-sm sm:text-base min-h-[52px] touch-manipulation"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Security Badge */}
              <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <span>SECURE LOGIN</span>
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-black dark:text-white hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ElegantLoginPage;
