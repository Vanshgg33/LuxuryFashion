import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react"; // 👈 use react, not next
import MainLayout from "./MainLayout";
import ProtectedPage from "./components/Helper.tsx";
import Shop from "./components/Shop.tsx";
import Login from "./components/Login.tsx";
import AdminLayout from "./components/Admin/AdminLayout.tsx";
import Dashboard from "./components/Admin/Dashboard.tsx";
import Products from "./components/Admin/Products.tsx";
import Gallery from "./components/Admin/Gallery.tsx";
import ProductDisplay from "./components/ProductDisplay.tsx";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Routes with Header + Footer */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Shop />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/category/:category" element={<ProductDisplay />} />
                        <Route path="/search/:query" element={<ProductDisplay />} />
                    </Route>

                    {/* Routes WITHOUT Header + Footer */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/owner" element={<ProtectedPage />} />

                    {/* Admin section with its own layout */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="gallery" element={<Gallery />} />
                    </Route>
                </Routes>
            </BrowserRouter>

            {/* 👇 Add Analytics here */}
            <Analytics />
        </>
    );
}

export default App;
