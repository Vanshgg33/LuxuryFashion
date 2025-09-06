import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedPage from './components/Helper';
import Login from './components/Login';
import './index.css';
import Shop from './components/Shop';
import Admin from './components/Admin';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedPage />} />
        <Route path="/login" element={<Login />} />
        <Route path ="/shop" element={<Shop />} />
        <Route path ="/Admin" element={<Admin/>}/>
      </Routes>
    </BrowserRouter>
  );
}




export default App;
