import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Users, ShoppingBag, TrendingUp, DollarSign, 
  Upload, Image, Save, X, Star, Eye, Package, Settings, 
  BarChart3, PieChart, Calendar, Filter, Search, Download,
  AlertCircle, CheckCircle, Camera, Layers
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category?: string;
  stock?: number;
  description?: string;
  featured?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  orders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: 'hero' | 'gallery' | 'banner';
  active: boolean;
}

const FashionAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Cashmere Oversized Coat',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      badge: 'New',
      rating: 4.9,
      reviewCount: 124,
      brand: 'LUNA',
      category: 'Outerwear',
      stock: 15,
      description: 'Luxurious cashmere blend coat with oversized silhouette',
      featured: true
    },
    {
      id: '2',
      name: 'Silk Midi Dress',
      price: 899,
      originalPrice: 1199,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      badge: 'Sale',
      rating: 4.8,
      reviewCount: 89,
      brand: 'AURORA',
      category: 'Dresses',
      stock: 8,
      description: 'Elegant silk midi dress with contemporary cut',
      featured: false
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      joinDate: '2024-01-15',
      orders: 12,
      totalSpent: 4560,
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      joinDate: '2024-03-22',
      orders: 7,
      totalSpent: 2890,
      status: 'active'
    }
  ]);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Hero Image 1',
      category: 'hero',
      active: true
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Hero Image 2',
      category: 'hero',
      active: true
    }
  ]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    image: '',
    brand: '',
    category: '',
    description: '',
    stock: 0,
    featured: false
  });

  const [newImage, setNewImage] = useState<Partial<GalleryImage>>({
    url: '',
    title: '',
    category: 'hero',
    active: true
  });

  const stats = {
    totalUsers: users.length,
    totalProducts: products.length,
    totalRevenue: users.reduce((sum, user) => sum + user.totalSpent, 0),
    totalOrders: users.reduce((sum, user) => sum + user.orders, 0)
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name!,
      price: newProduct.price!,
      image: newProduct.image!,
      brand: newProduct.brand || '',
      category: newProduct.category || '',
      description: newProduct.description || '',
      stock: newProduct.stock || 0,
      featured: newProduct.featured || false,
      rating: 4.5,
      reviewCount: 0
    };

    setProducts([...products, product]);
    setNewProduct({
      name: '',
      price: 0,
      image: '',
      brand: '',
      category: '',
      description: '',
      stock: 0,
      featured: false
    });
    setShowAddProduct(false);
    showNotification('success', 'Product added successfully!');
  };

  const handleEditProduct = (product: Product) => {
    const updatedProducts = products.map(p => 
      p.id === product.id ? product : p
    );
    setProducts(updatedProducts);
    setEditingProduct(null);
    showNotification('success', 'Product updated successfully!');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    showNotification('success', 'Product deleted successfully!');
  };

  const handleAddImage = () => {
    if (!newImage.url || !newImage.title) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    const image: GalleryImage = {
      id: Date.now().toString(),
      url: newImage.url!,
      title: newImage.title!,
      category: newImage.category!,
      active: newImage.active!
    };

    setGalleryImages([...galleryImages, image]);
    setNewImage({
      url: '',
      title: '',
      category: 'hero',
      active: true
    });
    setShowAddImage(false);
    showNotification('success', 'Image added successfully!');
  };

  const handleDeleteImage = (id: string) => {
    setGalleryImages(galleryImages.filter(img => img.id !== id));
    showNotification('success', 'Image deleted successfully!');
  };

  const toggleImageStatus = (id: string) => {
    setGalleryImages(galleryImages.map(img => 
      img.id === id ? { ...img, active: !img.active } : img
    ));
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', change: '+12%' },
          { title: 'Products', value: stats.totalProducts, icon: Package, color: 'green', change: '+5%' },
          { title: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'purple', change: '+18%' },
          { title: 'Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'orange', change: '+8%' }
        ].map((stat) => (
          <div key={stat.title} className="bg-white p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-serif font-medium text-gray-900 mt-1">{stat.value}</p>
                <p className="text-green-600 text-sm mt-1">{stat.change} from last month</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 border border-gray-200">
          <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Recent Orders</h3>
          <div className="space-y-4">
            {[
              { id: '#1234', customer: 'Sarah Johnson', amount: '$299', status: 'Completed' },
              { id: '#1235', customer: 'Michael Chen', amount: '$599', status: 'Processing' },
              { id: '#1236', customer: 'Emma Wilson', amount: '$199', status: 'Shipped' }
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-gray-600 text-sm">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-gray-600 text-sm">${product.price}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium text-gray-900">Product Management</h1>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-black text-white px-6 py-3 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center space-x-2 uppercase"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-medium text-gray-900">All Products ({products.length})</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                />
              </div>
              <button className="p-2 border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Product</th>
                <th className="text-left p-4 font-medium text-gray-900">Category</th>
                <th className="text-left p-4 font-medium text-gray-900">Price</th>
                <th className="text-left p-4 font-medium text-gray-900">Stock</th>
                <th className="text-left p-4 font-medium text-gray-900">Rating</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-gray-600 text-sm">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.category}</td>
                  <td className="p-4">
                    <span className="font-medium text-gray-900">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through ml-2">${product.originalPrice}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${product.stock! > 10 ? 'text-green-600' : product.stock! > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.featured ? 'Featured' : 'Regular'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium text-gray-900">User Management</h1>
        <button className="bg-black text-white px-6 py-3 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center space-x-2 uppercase">
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-medium text-gray-900">Registered Users ({users.length})</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">User</th>
                <th className="text-left p-4 font-medium text-gray-900">Join Date</th>
                <th className="text-left p-4 font-medium text-gray-900">Orders</th>
                <th className="text-left p-4 font-medium text-gray-900">Total Spent</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">{user.orders}</td>
                  <td className="p-4 font-medium text-gray-900">${user.totalSpent.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium text-gray-900">Image Gallery</h1>
        <button
          onClick={() => setShowAddImage(true)}
          className="bg-black text-white px-6 py-3 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center space-x-2 uppercase"
        >
          <Camera className="w-4 h-4" />
          <span>Add Image</span>
        </button>
      </div>

      {/* Image Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {['hero', 'gallery', 'banner'].map((category) => (
          <div key={category} className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-serif font-medium text-gray-900 capitalize">
                {category} Images ({galleryImages.filter(img => img.category === category).length})
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {galleryImages
                  .filter(img => img.category === category)
                  .map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-32 object-cover border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                        <button
                          onClick={() => toggleImageStatus(image.id)}
                          className={`p-2 rounded-full ${image.active ? 'bg-green-500' : 'bg-gray-500'} text-white hover:scale-110 transition-transform duration-200`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">{image.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            image.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {image.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProductModal = ({ product, onSave, onClose }: { 
    product?: Product | null, 
    onSave: (product: Product) => void, 
    onClose: () => void 
  }) => {
    const [formData, setFormData] = useState<Partial<Product>>(
      product || {
        name: '',
        price: 0,
        image: '',
        brand: '',
        category: '',
        description: '',
        stock: 0,
        featured: false
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.price || !formData.image) {
        showNotification('error', 'Please fill in all required fields');
        return;
      }

      const productData: Product = {
        id: product?.id || Date.now().toString(),
        name: formData.name!,
        price: formData.price!,
        image: formData.image!,
        brand: formData.brand || '',
        category: formData.category || '',
        description: formData.description || '',
        stock: formData.stock || 0,
        featured: formData.featured || false,
        rating: product?.rating || 4.5,
        reviewCount: product?.reviewCount || 0,
        originalPrice: formData.originalPrice,
        badge: formData.badge
      };

      onSave(productData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-serif font-medium text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Brand</label>
                <input
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                >
                  <option value="">Select category</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Blazers">Blazers</option>
                  <option value="Bags">Bags</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Price *</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Original Price</label>
                <input
                  type="number"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setFormData({...formData, originalPrice: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Product Image URL *</label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-4">
                  <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover border border-gray-200" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                rows={3}
                placeholder="Product description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Badge</label>
                <select
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({...formData, badge: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                >
                  <option value="">No badge</option>
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                  <option value="Limited">Limited</option>
                  <option value="Trending">Trending</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="w-4 h-4 text-black focus:ring-black border-gray-300"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-900">
                  Feature this product
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center space-x-2 uppercase"
              >
                <Save className="w-4 h-4" />
                <span>{product ? 'Update Product' : 'Add Product'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="border border-gray-300 text-gray-700 px-8 py-3 font-medium text-sm tracking-wide hover:bg-gray-50 transition-colors duration-300 uppercase"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ImageModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-serif font-medium text-gray-900">Add New Image</h3>
          <button onClick={() => setShowAddImage(false)} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Image URL *</label>
            <input
              type="url"
              value={newImage.url || ''}
              onChange={(e) => setNewImage({...newImage, url: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
              placeholder="https://example.com/image.jpg"
            />
            {newImage.url && (
              <div className="mt-4">
                <img src={newImage.url} alt="Preview" className="w-full h-48 object-cover border border-gray-200" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Image Title *</label>
            <input
              type="text"
              value={newImage.title || ''}
              onChange={(e) => setNewImage({...newImage, title: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
              placeholder="Enter image title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Category *</label>
            <select
              value={newImage.category || 'hero'}
              onChange={(e) => setNewImage({...newImage, category: e.target.value as 'hero' | 'gallery' | 'banner'})}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
            >
              <option value="hero">Hero Images</option>
              <option value="gallery">Gallery Images</option>
              <option value="banner">Banner Images</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="imageActive"
              checked={newImage.active || false}
              onChange={(e) => setNewImage({...newImage, active: e.target.checked})}
              className="w-4 h-4 text-black focus:ring-black border-gray-300"
            />
            <label htmlFor="imageActive" className="text-sm font-medium text-gray-900">
              Set as active
            </label>
          </div>

          <div className="flex items-center space-x-4 pt-6">
            <button
              onClick={handleAddImage}
              className="bg-black text-white px-8 py-3 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center space-x-2 uppercase"
            >
              <Save className="w-4 h-4" />
              <span>Add Image</span>
            </button>
            <button
              onClick={() => setShowAddImage(false)}
              className="border border-gray-300 text-gray-700 px-8 py-3 font-medium text-sm tracking-wide hover:bg-gray-50 transition-colors duration-300 uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-serif font-medium text-black tracking-widest">
                ÉLÉGANCE
                <span className="text-sm font-sans font-normal text-gray-500 ml-2">Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Welcome back, Admin</div>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'gallery', label: 'Gallery', icon: Image },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'gallery' && renderGallery()}
          
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-serif font-medium text-gray-900">Analytics</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="text-lg font-serif font-medium text-gray-900 mb-6">Sales Trends</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 border border-gray-200">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                      <p>Charts would be integrated here</p>
                      <p className="text-sm">Using Recharts or Chart.js</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="text-lg font-serif font-medium text-gray-900 mb-6">Category Performance</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 border border-gray-200">
                    <div className="text-center text-gray-500">
                      <PieChart className="w-12 h-12 mx-auto mb-4" />
                      <p>Pie chart would be here</p>
                      <p className="text-sm">Category breakdown</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-lg font-serif font-medium text-gray-900 mb-6">Revenue Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50">
                    <p className="text-3xl font-serif font-medium text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm mt-1">Total Revenue</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50">
                    <p className="text-3xl font-serif font-medium text-gray-900">${Math.round(stats.totalRevenue / stats.totalOrders)}</p>
                    <p className="text-gray-600 text-sm mt-1">Average Order Value</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50">
                    <p className="text-3xl font-serif font-medium text-gray-900">{Math.round(stats.totalOrders / stats.totalUsers)}</p>
                    <p className="text-gray-600 text-sm mt-1">Orders per Customer</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-serif font-medium text-gray-900">Settings</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="text-lg font-serif font-medium text-gray-900 mb-6">Site Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Site Name</label>
                      <input
                        type="text"
                        defaultValue="ÉLÉGANCE"
                        className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Contact Email</label>
                      <input
                        type="email"
                        defaultValue="admin@elegance.com"
                        className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Currency</label>
                      <select className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="text-lg font-serif font-medium text-gray-900 mb-6">Shipping Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Free Shipping Threshold</label>
                      <input
                        type="number"
                        defaultValue="200"
                        className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Standard Shipping Rate</label>
                      <input
                        type="number"
                        defaultValue="15"
                        className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Express Shipping Rate</label>
                      <input
                        type="number"
                        defaultValue="25"
                        className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-lg font-serif font-medium text-gray-900 mb-6">Notification Settings</h3>
                <div className="space-y-4">
                  {[
                    'Email notifications for new orders',
                    'Low stock alerts',
                    'Customer review notifications',
                    'Weekly sales reports'
                  ].map((setting) => (
                    <div key={setting} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-black focus:ring-black border-gray-300"
                      />
                      <label className="text-sm text-gray-900">{setting}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddProduct && (
        <ProductModal
          onSave={(product) => {
            setProducts([...products, product]);
            setShowAddProduct(false);
            showNotification('success', 'Product added successfully!');
          }}
          onClose={() => setShowAddProduct(false)}
        />
      )}

      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onSave={handleEditProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {showAddImage && <ImageModal />}
    </div>
  );
};

export default FashionAdminDashboard;