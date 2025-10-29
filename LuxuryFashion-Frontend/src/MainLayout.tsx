import { Outlet } from "react-router-dom";
import Header from "./components/header.tsx";
import Footer from "./components/footer.tsx";
import { useCart } from './contexts/CartContext';


const MainLayout: React.FC = () => {
    const { cartCount } = useCart();
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header cartCount={cartCount} />

            <main className="flex-1">
                <Outlet /> {/* nested pages will render here */}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
