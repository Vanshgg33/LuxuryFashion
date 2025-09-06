import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Shield, Check, X, Menu, User, ShoppingBag, Search } from "lucide-react";
import { socialLogin } from "../api/LoginRegisterApi";

type ContactMethod = "email" | "phone";
type FormMode = "login" | "signup";

interface FormData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  remember: boolean;
  agreeTerms: boolean;
}

const ElegantLoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [formMode, setFormMode] = useState<FormMode>("login");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    remember: false,
    agreeTerms: false,
  });

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setInitialLoad(false), 100);
  }, []);

  const togglePassword = (): void => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = (): void => setShowConfirmPassword((prev) => !prev);

  const toggleContactMethod = (method: ContactMethod): void => {
    setContactMethod(method);
    if (method === "email") {
      setFormData((prev) => ({ ...prev, phone: "" }));
    } else {
      setFormData((prev) => ({ ...prev, email: "" }));
    }
  };

  const switchFormMode = (mode: FormMode): void => {
    setFormMode(mode);
    setError("");
    if (mode === "login") {
      setFormData(prev => ({
        ...prev,
        confirmPassword: "",
        firstName: "",
        lastName: "",
        agreeTerms: false
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const triggerShake = (): void => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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

    if (formMode === "signup") {
      if (!formData.firstName || !formData.lastName) {
        setError("Please enter your full name");
        triggerShake();
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        triggerShake();
        setLoading(false);
        return;
      }
      if (!formData.agreeTerms) {
        setError("Please accept our terms and conditions");
        triggerShake();
        setLoading(false);
        return;
      }
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setTimeout(() => {
        console.log("Login/Signup successful!");
        window.location.href = '/shop';
      }, 1500);
    } catch (error: any) {
      setError("Login failed. Please check your credentials and try again.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string): Promise<void> => {
     socialLogin();
  };

  const handleForgotPassword = (): void => {
    alert("Password reset functionality would be implemented here");
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Custom CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentle-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes pulse-success {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 1s ease-out; }
        .animate-gentle-shake { animation: gentle-shake 0.5s ease-in-out; }
        .animate-pulse-success { animation: pulse-success 2s infinite; }
        
        .text-shadow-luxury {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .input-focus:focus {
          transform: translateY(-2px);
        }

        .button-hover:hover {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Success Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-full flex items-center justify-center animate-pulse-success">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-serif font-medium text-black mb-4">
              {formMode === "login" ? "Welcome Back" : "Welcome to Élégance"}
            </h3>
            <p className="text-gray-600 font-light">
              {formMode === "login" ? "Taking you to your collection..." : "Your account has been created successfully..."}
            </p>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl z-40 border-b border-gray-100 transition-all duration-300">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl md:text-3xl font-serif font-medium text-black tracking-widest hover:scale-105 transition-transform duration-300 cursor-pointer">
              ÉLÉGANCE
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-12">
              {['Women', 'Men', 'Accessories', 'New Arrivals', 'Sale'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="relative text-gray-700 hover:text-black transition-colors duration-300 font-medium text-sm tracking-wide group"
                >
                  {item}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-700 hover:text-black transition-colors duration-300">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-700 hover:text-black transition-colors duration-300 hidden md:block">
                <User className="w-5 h-5" />
              </button>
              <button className="relative p-2 text-gray-700 hover:text-black transition-colors duration-300">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center">0</span>
              </button>
              <button 
                className="lg:hidden p-2 text-gray-700 hover:text-black transition-colors duration-300"
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
                className="p-2 text-gray-700 hover:text-black transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col space-y-8 p-6">
              {['Women', 'Men', 'Accessories', 'New Arrivals', 'Sale'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-2xl font-serif text-gray-700 hover:text-black transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-0 min-h-screen">
          
          {/* Left Side - Hero Image */}
          <div className="relative overflow-hidden bg-gray-900 order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Fashion Model"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
            
            {/* Overlay Content */}
            <div className="absolute inset-0 flex items-end p-12 lg:p-16">
              <div className="text-white max-w-md">
                <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-shadow-luxury">
                  Your Style Journey
                  <span className="block text-xl font-light text-white/80 mt-2">
                    Begins Here
                  </span>
                </h2>
                <p className="text-white/80 font-light leading-relaxed">
                  Join our community of style connoisseurs and discover exclusive collections curated just for you.
                </p>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full opacity-60"></div>
            <div className="absolute bottom-1/3 left-1/5 w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full opacity-40"></div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center p-8 lg:p-16 bg-white order-1 lg:order-2">
            <div 
              ref={formRef}
              className={`w-full max-w-md transform transition-all duration-800 ${
                initialLoad ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
              } ${shake ? 'animate-gentle-shake' : ''}`}
            >
              {/* Form Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-black mb-4">
                  {formMode === "login" ? "Welcome Back" : "Join Élégance"}
                </h1>
                <div className="w-16 h-0.5 bg-black mx-auto mb-6"></div>
                <p className="text-gray-600 font-light text-lg">
                  {formMode === "login" 
                    ? "Sign in to your account" 
                    : "Create your exclusive account"
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-none flex items-center space-x-3 animate-fade-in-up">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 font-light">{error}</span>
                </div>
              )}

              {/* Contact Method Toggle (Login Only) */}
              {formMode === "login" && (
                <div className="flex mb-8 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleContactMethod("email")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                      contactMethod === "email" 
                        ? "bg-black text-white" 
                        : "bg-white text-gray-600 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleContactMethod("phone")}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 ${
                      contactMethod === "phone" 
                        ? "bg-black text-white" 
                        : "bg-white text-gray-600 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    Phone
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name Fields (Signup Only) */}
                {formMode === "signup" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black tracking-wide">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-all duration-300 text-black font-light input-focus"
                        required={formMode === "signup"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black tracking-wide">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-all duration-300 text-black font-light input-focus"
                        required={formMode === "signup"}
                      />
                    </div>
                  </div>
                )}

                {/* Email/Phone Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black tracking-wide">
                    {formMode === "signup" ? "EMAIL ADDRESS" : (contactMethod === "email" ? "EMAIL ADDRESS" : "PHONE NUMBER")}
                  </label>
                  <input
                    type={formMode === "signup" ? "email" : (contactMethod === "email" ? "email" : "tel")}
                    name={formMode === "signup" ? "email" : contactMethod}
                    value={formMode === "signup" ? formData.email : (contactMethod === "email" ? formData.email : formData.phone)}
                    onChange={handleInputChange}
                    placeholder={formMode === "signup" ? "your@email.com" : (contactMethod === "email" ? "your@email.com" : "+1 (555) 123-4567")}
                    className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-all duration-300 text-black font-light input-focus"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black tracking-wide">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full px-0 py-4 pr-12 bg-transparent border-0 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-all duration-300 text-black font-light input-focus"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors duration-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formMode === "signup" && (
                    <p className="text-xs text-gray-500 font-light mt-1">
                      Minimum 8 characters required
                    </p>
                  )}
                </div>

                {/* Confirm Password (Signup Only) */}
                {formMode === "signup" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-black tracking-wide">
                      CONFIRM PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="w-full px-0 py-4 pr-12 bg-transparent border-0 border-b-2 border-gray-200 focus:border-black focus:outline-none transition-all duration-300 text-black font-light input-focus"
                        required
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPassword}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors duration-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me / Terms */}
                <div className="flex items-center justify-between pt-4">
                  {formMode === "login" ? (
                    <>
                      <label className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          name="remember"
                          checked={formData.remember}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-black bg-white border-2 border-gray-300 rounded-sm focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="ml-3 text-sm font-light text-gray-700 group-hover:text-black tracking-wide">
                          Remember me
                        </span>
                      </label>
                      <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm font-light text-gray-600 hover:text-black transition-colors duration-300 tracking-wide"
                      >
                        Forgot password?
                      </button>
                    </>
                  ) : (
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleInputChange}
                        className="w-4 h-4 mt-1 text-black bg-white border-2 border-gray-300 rounded-sm focus:ring-0 focus:ring-offset-0"
                        required
                      />
                      <span className="text-sm text-gray-700 font-light leading-relaxed">
                        I agree to the{" "}
                        <button type="button" className="font-medium text-black hover:underline">
                          Terms & Conditions
                        </button>{" "}
                        and{" "}
                        <button type="button" className="font-medium text-black hover:underline">
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 px-6 bg-black text-white font-medium text-sm tracking-widest hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase button-hover ${
                    loading ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>
                      {formMode === "login" ? "Sign In" : "Create Account"}
                    </span>
                  )}
                </button>
              </form>

              {/* Social Login */}
              <div className="mt-12">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-light tracking-wide">
                      OR CONTINUE WITH
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Google")}
                    className="flex items-center justify-center px-4 py-4 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 hover:border-gray-300 group button-hover"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-black tracking-wide">
                      Google
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Apple")}
                    className="flex items-center justify-center px-4 py-4 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 hover:border-gray-300 group button-hover"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-black tracking-wide">
                      Apple
                    </span>
                  </button>
                </div>
              </div>

              {/* Form Mode Toggle */}
              <div className="mt-12 text-center">
                <p className="text-gray-600 font-light">
                  {formMode === "login" ? "New to Élégance?" : "Already have an account?"}
                  {" "}
                  <button
                    type="button"
                    onClick={() => switchFormMode(formMode === "login" ? "signup" : "login")}
                    className="font-medium text-black hover:underline transition-all duration-300 tracking-wide"
                  >
                    {formMode === "login" ? "Create Account" : "Sign In"}
                  </button>
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-gray-400" />
                  <span className="font-light tracking-wide">SECURE LOGIN</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-light tracking-wide">SSL PROTECTED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="text-2xl font-serif font-medium text-black tracking-widest">
                ÉLÉGANCE
              </div>
              <p className="text-gray-600 font-light leading-relaxed">
                Curating timeless fashion for the modern connoisseur of style and sophistication
              </p>
              <div className="flex space-x-4">
                {['Instagram', 'Pinterest', 'Twitter'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-100 hover:bg-black hover:text-white transition-all duration-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium"
                  >
                    {social.charAt(0)}
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Shop',
                links: ['Women', 'Men', 'Accessories', 'New Arrivals', 'Sale']
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Press', 'Sustainability', 'Contact']
              },
              {
                title: 'Support',
                links: ['Size Guide', 'Shipping', 'Returns', 'Care Guide', 'FAQ']
              }
            ].map((section) => (
              <div key={section.title} className="space-y-6">
                <h3 className="font-serif font-medium text-black text-lg">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="block text-gray-600 hover:text-black transition-colors duration-300 font-light"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-500 font-light text-sm">
                © 2025 Élégance. All rights reserved.
              </div>
              <div className="flex items-center space-x-8 text-sm">
                <a href="#" className="text-gray-500 hover:text-black transition-colors duration-300 font-light">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-500 hover:text-black transition-colors duration-300 font-light">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-500 hover:text-black transition-colors duration-300 font-light">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ElegantLoginPage;