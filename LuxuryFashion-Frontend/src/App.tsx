import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedPage from './components/Helper';
import Login from './components/Login';
import './index.css';
import Shop from './components/Shop';

import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import Products from './components/Admin/Products';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Protected routes */}
        <Route path="/" element={<ProtectedPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<Shop />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} /> {/* /admin */}
          <Route path="products" element={<Products />} /> {/* /admin/products */}
          {/* <Route path="users" element={<Users />} />      
          <Route path="orders" element={<Orders />} />     
          <Route path="gallery" element={<Gallery />} />   */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}



export default App;
