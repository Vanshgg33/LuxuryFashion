import { Outlet } from "react-router-dom";
import Header from "./components/header.tsx";
import Footer from "./components/footer.tsx";


const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1">
                <Outlet /> {/* nested pages will render here */}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
