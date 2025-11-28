import { Link } from "react-router-dom";
import { UtensilsCrossed, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold">Foodie</span>
            </Link>
            <p className="text-muted-foreground">
              Delicious food delivered fresh to your doorstep. Quality ingredients, amazing taste.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["Home", "Menu", "Orders", "Profile"].map((link) => (
                <li key={link}>
                  <Link
                    to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-3">
              {["Veg", "Non-Veg", "South Indian", "Fast Food", "Desserts", "Beverages"].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/menu?category=${cat}`}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>123 Food Street, Mumbai</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>hello@foodie.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Foodie. All rights reserved. Made with ❤️</p>
        </div>
      </div>
    </footer>
  );
}
