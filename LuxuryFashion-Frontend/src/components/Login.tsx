import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Shield, X, Menu, User, ShoppingBag, Search } from "lucide-react";
import { loginUser } from "../api/LoginRegisterApi";
import { useNavigate } from "react-router-dom";

type ContactMethod = "email" | "phone";

interface FormData {
  email: string;
  phone: string;
  password: string;
  remember: boolean;
}

const ElegantLoginPage: React.FC = () => {
  const navigate = useNavigate();
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
  }, []);

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
      console.log("Login success:", response);
      navigate("/admin");
    } catch (error: any) {
      console.error("Error during login:", error);
      setError("Login failed. Please check your credentials.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Password reset functionality would be implemented here");
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
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
      <main className="pt-16 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 min-h-screen">
          {/* Left Side - Hero */}
          <div className="relative overflow-hidden bg-gray-900 order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Fashion Model"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center p-8 lg:p-16 bg-white order-1 lg:order-2">
            <div
              ref={formRef}
              className={`w-full max-w-md transition-all duration-800 ${
                initialLoad ? "translate-y-10 opacity-0" : "translate-y-0 opacity-100"
              } ${shake ? "animate-gentle-shake" : ""}`}
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-black mb-4">
                  Welcome Back
                </h1>
                <div className="w-16 h-0.5 bg-black mx-auto mb-6"></div>
                <p className="text-gray-600 font-light text-lg">Sign in to your account</p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 flex items-center space-x-3">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-light">{error}</span>
                </div>
              )}

              {/* Contact Method Toggle */}
              <div className="flex mb-8 border border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleContactMethod("email")}
                  className={`flex-1 py-4 ${contactMethod === "email" ? "bg-black text-white" : "bg-white text-gray-600"}`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => toggleContactMethod("phone")}
                  className={`flex-1 py-4 ${contactMethod === "phone" ? "bg-black text-white" : "bg-white text-gray-600"}`}
                >
                  Phone
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium"> 
                    {contactMethod === "email" ? "Email Address" : "Phone Number"}
                  </label>
                  <input
                    type={contactMethod === "email" ? "email" : "tel"}
                    name={contactMethod}
                    value={contactMethod === "email" ? formData.email : formData.phone}
                    onChange={handleInputChange}
                    placeholder={contactMethod === "email" ? "your@email.com" : "+1 (555) 123-456"}
                    className="w-full border-b-2 border-gray-200 focus:border-black outline-none py-3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full border-b-2 border-gray-200 focus:border-black outline-none py-3 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <button type="button" onClick={handleForgotPassword} className="text-sm text-gray-600 hover:text-black">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white hover:bg-gray-800 transition"
                >
                  {loading ? "Processing..." : "Sign In"}
                </button>
              </form>

              {/* Security Badge */}
              <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-gray-400" />
                  <span>SECURE LOGIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ElegantLoginPage;
