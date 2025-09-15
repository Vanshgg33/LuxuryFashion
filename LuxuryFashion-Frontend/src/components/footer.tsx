import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Top Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand + Socials */}
          <div className="space-y-6 text-center sm:text-left">
            <div className="text-2xl font-serif font-medium text-white tracking-widest">
              ÉLÉGANCE
            </div>
            <p className="text-gray-400 font-light leading-relaxed max-w-xs mx-auto sm:mx-0">
              Curating timeless fashion for the modern connoisseur of style and
              sophistication
            </p>
            <div className="flex justify-center sm:justify-start space-x-4">
              {["Instagram", "Pinterest", "Twitter"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-white hover:text-black transition-all duration-300 rounded-full flex items-center justify-center text-gray-400 text-sm"
                >
                  {social.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {[
            {
              title: "Shop",
              links: ["Women", "Men", "Accessories", "New Arrivals", "Sale"],
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Press", "Sustainability", "Contact"],
            },
            {
              title: "Support",
              links: ["Size Guide", "Shipping", "Returns", "Care Guide", "FAQ"],
            },
          ].map((section) => (
            <div key={section.title} className="space-y-6 text-center sm:text-left">
              <h3 className="font-serif font-medium text-white text-lg">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="relative block text-gray-400 hover:text-white transition-colors duration-300 font-light group"
                  >
                    {link}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
            <div className="text-gray-500 font-light text-sm">
              © 2025 Élégance. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-8 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="relative text-gray-500 hover:text-white transition-colors duration-300 font-light group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
