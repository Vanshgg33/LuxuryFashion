import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Top Sections - Limeroad Style Multi-column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* About/Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base mb-4">About Us</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                About LuxuryFashion
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Careers
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Press
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Contact Us
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base mb-4">Customer Service</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Shipping Information
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Returns & Exchanges
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Size Guide
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                FAQ
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Track Your Order
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Women
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Men
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Accessories
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                Sale
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                New Arrivals
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base mb-4">Legal</h3>
            <div className="space-y-2 text-sm">
              <Link to="/privacy-policy" className="block text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="block text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/refund-policy" className="block text-gray-400 hover:text-white transition-colors">
                Refund Policy
              </Link>
              <Link to="/cookie-policy" className="block text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base mb-4">Stay Connected</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for exclusive offers and updates
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-200"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label="Subscribe to newsletter"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </form>
            {/* Social Media Icons */}
            <div className="flex gap-3 mt-4">
              {["Instagram", "Facebook", "Twitter", "Pinterest"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  aria-label={social}
                >
                  <span className="text-xs">{social.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods & Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500">
              © 2025 LuxuryFashion. All rights reserved.
            </div>
            {/* Payment Method Icons */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="mr-2">We Accept:</span>
              {["Visa", "Mastercard", "PayPal", "UPI"].map((method) => (
                <span key={method} className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
