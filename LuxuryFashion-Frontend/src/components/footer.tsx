import { Link } from "react-router-dom";
import { UtensilsCrossed, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12 md:mt-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="space-y-3 md:space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <span className="text-xl md:text-2xl font-display font-bold">Foodie</span>
            </Link>
            <p className="text-sm md:text-base text-muted-foreground">
              Delicious food delivered fresh to your doorstep. Quality ingredients, amazing taste.
            </p>
            <div className="flex gap-3 md:gap-4">
              <a href="#" className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Instagram className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Facebook className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-base md:text-lg mb-3 md:mb-4">Quick Links</h3>
            <ul className="space-y-2 md:space-y-3">
              {["Home", "Menu", "Orders", "Profile"].map((link) => (
                <li key={link}>
                  <Link
                    to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-base md:text-lg mb-3 md:mb-4">Categories</h3>
            <ul className="space-y-2 md:space-y-3">
              {["Veg", "Non-Veg", "South Indian", "Fast Food", "Desserts", "Beverages"].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/menu?category=${cat}`}
                    className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-base md:text-lg mb-3 md:mb-4">Contact Us</h3>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span>123 Food Street, Mumbai</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span>hello@foodie.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border text-center text-xs md:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Foodie. All rights reserved. Made with ❤️</p>
        </div>
      </div>
    </footer>
  );
}
