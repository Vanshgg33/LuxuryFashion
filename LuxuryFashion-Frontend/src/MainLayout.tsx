import { Outlet } from "react-router-dom";
import Header from "./components/header.tsx";
import Footer from "./components/footer.tsx";
import MobileBottomNav from "./components/MobileBottomNav.tsx";
import WhatsAppButton from "./components/WhatsAppButton.tsx";
import { useCart } from './contexts/CartContext';


const MainLayout: React.FC = () => {
    const { cartCount } = useCart();
    
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            <Header cartCount={cartCount} />

            <main className="flex-1 bg-white dark:bg-gray-900 transition-colors duration-200 pt-20 lg:pt-28 pb-16 lg:pb-0">
                <Outlet /> {/* nested pages will render here */}
            </main>

            <Footer />
            <MobileBottomNav />
            <WhatsAppButton phoneNumber="91981260291" message="Hello! I need help with my order." />
        </div>
    );
};

export default MainLayout;
