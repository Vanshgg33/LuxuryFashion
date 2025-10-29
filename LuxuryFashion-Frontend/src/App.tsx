import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import ProtectedPage from "./components/Helper.tsx";
import Shop from "./components/Shop.tsx";
import Home from "./components/Home.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";
import Cart from "./components/Cart.tsx";
import Checkout from "./components/Checkout.tsx";
import OrderHistory from "./components/OrderHistory.tsx";
import OrderConfirmation from "./components/OrderConfirmation.tsx";
import AdminLayout from "./components/Admin/AdminLayout.tsx";
import Dashboard from "./components/Admin/Dashboard.tsx";
import Products from "./components/Admin/Products.tsx";
import Gallery from "./components/Admin/Gallery.tsx";
import Users from "./components/Admin/Users.tsx";
import Orders from "./components/Admin/Orders.tsx";
import ProductDisplay from "./components/ProductDisplay.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <CartProvider>
                    <BrowserRouter>
                    <Routes>
                        {/* Routes with Header + Footer */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/category/:category" element={<ProductDisplay />} />
                            <Route path="/search/:query" element={<ProductDisplay />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/orders" element={<OrderHistory />} />
                            <Route path="/order/:orderId" element={<OrderConfirmation />} />
                            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                        </Route>

                        {/* Routes WITHOUT Header + Footer */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/owner" element={<ProtectedPage />} />

                        {/* Admin section with its own layout */}
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="products" element={<Products />} />
                            <Route path="users" element={<Users />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="gallery" element={<Gallery />} />
                        </Route>
                    </Routes>
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
