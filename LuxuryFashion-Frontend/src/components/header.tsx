import React, { useState } from 'react';
import { Search, User, Menu, X, ShoppingBag } from 'lucide-react';

interface HeaderProps {
    cartCount?: number;
    isLoggedIn?: boolean;
}

const Header: React.FC<HeaderProps> = ({
                                           cartCount = 0,
                                           isLoggedIn = false
                                       }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
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
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
                            )}
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
    );
};

export default Header;