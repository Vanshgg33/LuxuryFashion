import React, { useState, useRef } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Shield, Sparkles } from 'lucide-react';
import { registerUser } from '../api/LoginRegisterApi';
import type { SignupRequest } from '../api/LoginRegisterApi';
import { useNavigate, Link } from 'react-router-dom';
import { OAUTH_LOGIN_URL } from '../api/base';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<SignupRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
  });

  React.useEffect(() => {
    setTimeout(() => setInitialLoad(false), 100);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerUser(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = OAUTH_LOGIN_URL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-4 sm:py-8 md:py-12 px-2 sm:px-4">
      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-4rem)] shadow-xl sm:shadow-2xl rounded-lg sm:rounded-2xl overflow-hidden">
        {/* Left Side - Hero */}
        <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Fashion Model"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white z-10">
            <div className="text-center space-y-6 animate-fade-in-up">
              <div className="inline-block mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm border border-white/20">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Join ÉLÉGANCE</h2>
              <div className="w-24 h-1 bg-white/30 mx-auto"></div>
              <p className="text-lg md:text-xl font-light text-gray-200 max-w-md">
                Start your journey to luxury fashion and exclusive collections
              </p>
              <div className="flex items-center justify-center space-x-6 mt-8">
                <div className="text-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse mx-auto mb-2"></div>
                  <span className="text-sm text-gray-300">Premium</span>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse mx-auto mb-2"></div>
                  <span className="text-sm text-gray-300">Exclusive</span>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse mx-auto mb-2"></div>
                  <span className="text-sm text-gray-300">Luxury</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-16 bg-white dark:bg-gray-800 relative overflow-hidden min-h-[calc(100vh-4rem)] sm:min-h-auto">
          {/* Decorative Background Elements - Hidden on mobile */}
          <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-700/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="hidden sm:block absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-gray-100 to-transparent dark:from-gray-700/30 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div
            ref={formRef}
            className={`w-full max-w-md relative z-10 transition-all duration-800 ${
              initialLoad ? "translate-y-10 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <div className="inline-block mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-black to-gray-700 dark:from-white dark:to-gray-300 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-lg">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white dark:text-black" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-black dark:text-white mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Create Account
              </h2>
              <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent mx-auto mb-3 sm:mb-4 md:mb-6"></div>
              <p className="text-gray-600 dark:text-gray-400 font-light text-sm sm:text-base md:text-lg px-2">Join LuxuryFashion today</p>
            </div>

            {error && (
              <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 border-l-4 border-red-500 dark:border-red-400 rounded-lg shadow-md flex items-start sm:items-center space-x-2 sm:space-x-3 animate-slide-down">
                <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-red-700 dark:text-red-300 font-medium text-xs sm:text-sm flex-1">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-800/40 border-l-4 border-green-500 dark:border-green-400 rounded-lg shadow-md flex items-start sm:items-center space-x-2 sm:space-x-3 animate-slide-down">
                <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-700 dark:text-green-300 font-medium text-xs sm:text-sm flex-1">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-9 sm:pl-10 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl px-3 py-4 sm:py-3.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-300 bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-9 sm:pl-10 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl px-3 py-4 sm:py-3.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-300 bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-9 sm:pl-10 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl px-3 py-4 sm:py-3.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-300 bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-9 sm:pl-10 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl px-3 py-4 sm:py-3.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-300 bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                    placeholder="+1 (555) 123-456"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-9 sm:pl-10 pr-12 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl px-3 py-4 sm:py-3.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-300 bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors touch-manipulation rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 sm:w-6 sm:h-6" /> : <Eye className="h-5 w-5 sm:w-6 sm:h-6" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-black via-gray-800 to-black dark:from-white dark:via-gray-200 dark:to-white text-white dark:text-black hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 dark:hover:from-gray-200 dark:hover:via-gray-100 dark:hover:to-gray-200 active:scale-[0.98] transition-all duration-300 text-base sm:text-lg font-bold touch-manipulation rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] min-h-[52px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Create Account</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignup}
              className="w-full py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 flex items-center justify-center space-x-3 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md font-medium text-sm sm:text-base min-h-[52px] touch-manipulation"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Security Badge */}
            <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                <span>SECURE REGISTRATION</span>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-black dark:text-white hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
