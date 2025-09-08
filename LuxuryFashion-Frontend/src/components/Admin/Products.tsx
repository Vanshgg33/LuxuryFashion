import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus, Edit, Trash2, X, Star, Search, Filter, Eye, Package,
  TrendingUp, AlertCircle, CheckCircle, XCircle, Upload, Image as ImageIcon
} from 'lucide-react';
import { addProductApi } from '../../api/AdminApi';

// Enhanced Product interface with all fields
export interface Product {
  id?: string;
  prod_id?: number;
  prod_name: string;
  name?: string;
  prod_price: number;
  price?: number;
  originalPrice?: number;
  prod_image: string;
  image?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  brand: string;
  prod_category: string;
  category?: string;
  prod_quantity: number;
  stock?: number;
  prod_description: string;
  description?: string;
  featured?: boolean;
  prod_tag?: string;
  prod_gender?: string;
  prod_status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductsContextType {
  showNotification: (type: 'success' | 'error' | 'warning', message: string) => void;
}
const addProduct = async (product: Product) => {
  try {
    // Call API with product, not the function!
    await addProductApi(product);

    console.log("Product saved:", product);
    return product;
  } catch (error) {
    console.error("Error saving product:", error);
    throw error;
  }
};


const Products: React.FC = () => {
  const { showNotification } = useOutletContext<ProductsContextType>();

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      prod_id: 1,
      prod_name: 'Cashmere Oversized Coat',
      prod_price: 1299,
      prod_image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=80',
      badge: 'New',
      rating: 4.9,
      reviewCount: 124,
      brand: 'LUNA',
      prod_category: 'Outerwear',
      prod_quantity: 15,
      prod_description: 'Luxurious cashmere blend coat with oversized silhouette. Perfect for cold weather with premium materials.',
      featured: true,
      prod_tag: 'luxury',
      prod_gender: 'unisex',
      prod_status: 'ACTIVE',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-02-01T14:20:00Z'
    },
    {
      id: '2',
      prod_id: 2,
      prod_name: 'Silk Midi Dress',
      prod_price: 899,
      originalPrice: 1199,
      prod_image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
      badge: 'Sale',
      rating: 4.8,
      reviewCount: 89,
      brand: 'AURORA',
      prod_category: 'Dresses',
      prod_quantity: 8,
      prod_description: 'Elegant silk midi dress with contemporary cut. Features flowing fabric and modern silhouette.',
      featured: false,
      prod_tag: 'elegant',
      prod_gender: 'women',
      prod_status: 'ACTIVE',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-25T16:45:00Z'
    },
    {
      id: '3',
      prod_id: 3,
      prod_name: 'Premium Leather Boots',
      prod_price: 649,
      prod_image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
      badge: 'Best Seller',
      rating: 4.7,
      reviewCount: 203,
      brand: 'HERITAGE',
      prod_category: 'Footwear',
      prod_quantity: 0,
      prod_description: 'Handcrafted leather boots with premium materials. Durable and stylish for everyday wear.',
      featured: true,
      prod_tag: 'leather',
      prod_gender: 'unisex',
      prod_status: 'OUT_OF_STOCK',
      createdAt: '2024-01-05T11:00:00Z',
      updatedAt: '2024-02-10T10:30:00Z'
    }
  ]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const categories = ['Dresses', 'Outerwear', 'Footwear', 'Jewelry', 'Blazers', 'Bags', 'Accessories'];
  const statuses = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'];
  const genders = ['men', 'women', 'unisex'];

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.prod_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.prod_description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.prod_category === selectedCategory;
      const matchesStatus = !selectedStatus || product.prod_status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.prod_name.localeCompare(b.prod_name);
        case 'price':
          return a.prod_price - b.prod_price;
        case 'stock':
          return a.prod_quantity - b.prod_quantity;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const handleEditProduct = (product: Product) => {
    const updatedProducts = products.map(p =>
      p.id === product.id ? { ...product, updatedAt: new Date().toISOString() } : p
    );
    setProducts(updatedProducts);
    setEditingProduct(null);
    showNotification('success', 'Product updated successfully!');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    showNotification('success', 'Product deleted successfully!');
  };
const handleAddProduct = async (product: Product) => {
  try {
    const newProduct = {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

   
    const savedProduct = await addProductApi(newProduct);

 
    setProducts((prev) => [...prev, savedProduct]);
    setShowAddProduct(false);
    showNotification("success", "Product added successfully!");
  } catch {
    showNotification("error", "Failed to add product");
  }
};



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'OUT_OF_STOCK': return 'bg-red-100 text-red-800';
      case 'DISCONTINUED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600';
    if (quantity <= 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const ProductModal = ({ product, onSave, onClose }: {
    product?: Product | null,
    onSave: (product: Product) => void,
    onClose: () => void
  }) => {
    const [formData, setFormData] = useState<Partial<Product>>(
      product || {
        prod_name: '',
        prod_price: 0,
        originalPrice: 0,
        prod_image: '',
        brand: '',
        prod_category: '',
        prod_description: '',
        prod_quantity: 0,
        featured: false,
        badge: '',
        prod_tag: '',
        prod_gender: '',
        prod_status: 'ACTIVE',
        rating: 4.5,
        reviewCount: 0
      }
    );

    const [imagePreview, setImagePreview] = useState(product?.prod_image || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.prod_name?.trim()) newErrors.prod_name = 'Product name is required';
      if (!formData.prod_price || formData.prod_price <= 0) newErrors.prod_price = 'Valid price is required';
      if (!formData.brand?.trim()) newErrors.brand = 'Brand is required';
      if (!formData.prod_category) newErrors.prod_category = 'Category is required';
      if (!formData.prod_image?.trim()) newErrors.prod_image = 'Product image URL is required';
      if (formData.prod_quantity === undefined || formData.prod_quantity < 0) newErrors.prod_quantity = 'Valid quantity is required';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      const productData: Product = {
        ...formData,
        // id: product?.id || Date.now().toString(),
        // prod_id: product?.prod_id || Date.now(),
        prod_name: formData.prod_name!,
        prod_price: formData.prod_price!,
        prod_image: formData.prod_image!,
        brand: formData.brand!,
        prod_category: formData.prod_category!,
        prod_description: formData.prod_description || '',
        prod_quantity: formData.prod_quantity || 0,
        featured: formData.featured || false,
        rating: formData.rating || 4.5,
        reviewCount: formData.reviewCount || 0,
        prod_status: formData.prod_status || 'ACTIVE'
      } as Product;

      onSave(productData);
    };

    const handleImageChange = (url: string) => {
      setFormData({ ...formData, prod_image: url });
      setImagePreview(url);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white max-w-4xl w-full max-h-[95vh] overflow-y-auto rounded-lg shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
            <h3 className="text-2xl font-serif font-medium text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.prod_name || ''}
                    onChange={(e) => setFormData({ ...formData, prod_name: e.target.value })}
                    className={`w-full px-4 py-3 border ${errors.prod_name ? 'border-red-300' : 'border-gray-200'} focus:border-black focus:outline-none transition-colors duration-300 rounded-md`}
                    placeholder="Enter product name"
                  />
                  {errors.prod_name && <p className="text-red-500 text-sm mt-1">{errors.prod_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={`w-full px-4 py-3 border ${errors.brand ? 'border-red-300' : 'border-gray-200'} focus:border-black focus:outline-none transition-colors duration-300 rounded-md`}
                    placeholder="Enter brand name"
                  />
                  {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.prod_category || ''}
                    onChange={(e) => setFormData({ ...formData, prod_category: e.target.value })}
                    className={`w-full px-4 py-3 border ${errors.prod_category ? 'border-red-300' : 'border-gray-200'} focus:border-black focus:outline-none transition-colors duration-300 rounded-md`}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.prod_category && <p className="text-red-500 text-sm mt-1">{errors.prod_category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Gender</label>
                  <select
                    value={formData.prod_gender || ''}
                    onChange={(e) => setFormData({ ...formData, prod_gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
                  >
                    <option value="">Select gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.prod_description || ''}
                  onChange={(e) => setFormData({ ...formData, prod_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Pricing & Inventory</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.prod_price || ''}
                    onChange={(e) => setFormData({ ...formData, prod_price: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-3 border ${errors.prod_price ? 'border-red-300' : 'border-gray-200'} focus:border-black focus:outline-none transition-colors duration-300 rounded-md`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.prod_price && <p className="text-red-500 text-sm mt-1">{errors.prod_price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Original Price</label>
                  <input
                    type="number"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.prod_quantity || ''}
                    onChange={(e) => setFormData({ ...formData, prod_quantity: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 border ${errors.prod_quantity ? 'border-red-300' : 'border-gray-200'} focus:border-black focus:outline-none transition-colors duration-300 rounded-md`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.prod_quantity && <p className="text-red-500 text-sm mt-1">{errors.prod_quantity}</p>}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Product Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tag</label>
                  <input
                    type="text"
                    value={formData.prod_tag || ''}
                    onChange={(e) => setFormData({ ...formData, prod_tag: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
                    placeholder="e.g., luxury, casual, formal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Badge</label>
                  <select
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
                  >
                    <option value="">No badge</option>
                    <option value="New">New</option>
                    <option value="Sale">Sale</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                  <select
                    value={formData.prod_status || ''}
                    onChange={(e) => setFormData({ ...formData, prod_status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-900">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Product Image</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Product Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.prod_image || ''}
                  onChange={(e) => handleImageChange(e.target.value)}
                  className={`w-full px-4 py-3 border ${errors.prod_image ? 'border-red-300' : 'border-gray-200'} focus:border-black focus:outline-none transition-colors duration-300 rounded-md`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.prod_image && <p className="text-red-500 text-sm mt-1">{errors.prod_image}</p>}
                
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-48 object-cover border border-gray-200 rounded-md shadow-sm"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
              >
                <Package className="w-5 h-5" />
                <span>{product ? 'Update Product' : 'Add Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">
            Product Management
          </h1>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>{products.length} Total Products</span>
            </span>
            <span className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>{products.filter(p => p.featured).length} Featured</span>
            </span>
            <span className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{products.filter(p => p.prod_quantity <= 10).length} Low Stock</span>
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-black text-white px-6 py-3 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center space-x-2 uppercase rounded-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-medium text-gray-900">
              Products ({filteredProducts.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Product</th>
                <th className="text-left p-4 font-medium text-gray-900">Category</th>
                <th className="text-left p-4 font-medium text-gray-900">Price</th>
                <th className="text-left p-4 font-medium text-gray-900">Stock</th>
                <th className="text-left p-4 font-medium text-gray-900">Rating</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Created</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={product.prod_image}
                          alt={product.prod_name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                          }}
                        />
                        {product.featured && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
                            ⭐
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.prod_name}</p>
                        <p className="text-gray-600 text-sm">{product.brand}</p>
                        {product.badge && (
                          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                            product.badge === 'New' ? 'bg-blue-100 text-blue-800' :
                            product.badge === 'Sale' ? 'bg-red-100 text-red-800' :
                            product.badge === 'Best Seller' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-900">{product.prod_category}</span>
                    {product.prod_gender && (
                      <span className="block text-xs text-gray-500 mt-1 capitalize">
                        {product.prod_gender}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">${product.prod_price}</span>
                      {product.originalPrice && product.originalPrice > product.prod_price && (
                        <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getStockColor(product.prod_quantity)}`}>
                        {product.prod_quantity}
                      </span>
                      <span className="text-gray-500 text-sm">units</span>
                      {product.prod_quantity <= 10 && product.prod_quantity > 0 && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      {product.prod_quantity === 0 && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{product.rating || 4.5}</span>
                      </div>
                      <span className="text-gray-500 text-sm">({product.reviewCount || 0})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.prod_status)}`}>
                      {product.prod_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      {product.createdAt && new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Toggle view details (could open a detailed view)
                          showNotification('info', `Viewing details for ${product.prod_name}`);
                        }}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200 rounded-md"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${product.prod_name}"?`)) {
                            handleDeleteProduct(product.id!);
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-md"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Package className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-3xl font-bold text-green-600">
                {products.filter(p => p.prod_status === 'ACTIVE').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">
                {products.filter(p => p.prod_quantity <= 10 && p.prod_quantity > 0).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">
                {products.filter(p => p.prod_quantity === 0).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddProduct && (
        <ProductModal
          onSave={handleAddProduct}
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
    </div>
  );
};

export default Products;