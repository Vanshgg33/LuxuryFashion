import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus, Edit, Trash2, X, Star, Search, Filter, Eye, Package,
  TrendingUp, AlertCircle, CheckCircle, XCircle, Upload, Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { addProductApi, fetchProductsApi } from '../../api/AdminApi';

// Enhanced Product interface with multiple images
export interface Product {
  id?: string;
  prod_id?: number;
  prod_name: string;
  prod_price: number;
  originalPrice?: number;

  // Single image for backward compatibility
  prod_image?: string;
  // Multiple images array (base64 strings from backend)
  prod_images: string[];

  brand: string;
  prod_category: string;
  prod_quantity: number;
  prod_description: string;
  prod_status: string;

  prod_tag?: string;
  prod_gender?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;

  createdAt?: string;
  updatedAt?: string;

  // For uploads
  prod_photos?: File[];
}

interface ProductsContextType {
  showNotification: (type: 'success' | 'error' | 'warning', message: string) => void;
}

// Updated addProduct function with correct field mapping
const addProduct = async (product: Product) => {
  try {
    const formData = new FormData();
    formData.append("prod_name", product.prod_name);
    formData.append("prod_price", product.prod_price.toString());
    formData.append("brand", product.brand);
    formData.append("prod_category", product.prod_category);
    formData.append("prod_description", product.prod_description);
    formData.append("prod_quantity", product.prod_quantity.toString());
    formData.append("prod_status", product.prod_status);

    // Fix: Use selling_price instead of originalPrice
    if (product.originalPrice) {
      formData.append("selling_price", product.originalPrice.toString());
    }
    
    if (product.badge) formData.append("badge", product.badge);
    if (product.prod_tag) formData.append("prod_tag", product.prod_tag);
    if (product.prod_gender) formData.append("prod_gender", product.prod_gender);
    if (product.rating) formData.append("rating", product.rating.toString());
    
    // Note: reviewCount and featured are not supported by backend DTO
    // You'll need to add these fields to ProductDto if needed

    // Fix: Use correct field name for photos
    if (product.prod_photos && product.prod_photos.length > 0) {
      product.prod_photos.forEach((photo) => {
        formData.append("prod_photo", photo); // Changed from prod_photos to prod_photo
      });
    }

    return await addProductApi(formData);
  } catch (error) {
    console.error("Error saving product:", error);
    throw error;
  }
};


const Products: React.FC = () => {
  const { showNotification } = useOutletContext<ProductsContextType>();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Dresses', 'Outerwear', 'Footwear', 'Jewelry', 'Blazers', 'Bags', 'Accessories'];
  const statuses = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'];
  const genders = ['men', 'women', 'unisex'];

  // Process products after fetching to ensure proper image handling
  const processProducts = (fetchedProducts: Product[]): Product[] => {
    return fetchedProducts.map(product => {
      // Ensure prod_images is always an array
      let images: string[] = [];
      
      if (product.prod_images && Array.isArray(product.prod_images)) {
        images = product.prod_images;
      } else if (product.prod_image) {
        // If single image exists, convert to array
        images = [product.prod_image];
      }
      
      // Set primary image for backward compatibility
      const primaryImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/300x300?text=No+Image';

      return {
        ...product,
        prod_images: images,
        prod_image: primaryImage,
        // Ensure numeric fields are properly typed
        prod_price: Number(product.prod_price) || 0,
        prod_quantity: Number(product.prod_quantity) || 0,
        rating: Number(product.rating) || 4.5,
        reviewCount: Number(product.reviewCount) || 0
      };
    });
  };

  // Fetch products from database on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await fetchProductsApi();
        const processedProducts = processProducts(fetchedProducts);
        setProducts(processedProducts);
        console.log('Fetched and processed products:', processedProducts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(errorMessage);
        showNotification('error', errorMessage);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [showNotification]);

  // Filter and sort products when dependencies change
  const safeLower = (val?: string | null) => (val ?? "").toLowerCase();

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch =
        safeLower(product.prod_name).includes(searchTerm.toLowerCase()) ||
        safeLower(product.brand).includes(searchTerm.toLowerCase()) ||
        safeLower(product.prod_description).includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || product.prod_category === selectedCategory;
      const matchesStatus = !selectedStatus || product.prod_status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort products safely
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return safeLower(a.prod_name).localeCompare(safeLower(b.prod_name));
        case "price":
          return (a.prod_price ?? 0) - (b.prod_price ?? 0);
        case "stock":
          return (a.prod_quantity ?? 0) - (b.prod_quantity ?? 0);
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const handleEditProduct = async (product: Product) => {
    try {
      const formData = new FormData();
      
      formData.append('prod_name', product.prod_name);
      formData.append('prod_price', product.prod_price.toString());
      formData.append('brand', product.brand);
      formData.append('prod_category', product.prod_category);
      formData.append('prod_description', product.prod_description);
      formData.append('prod_quantity', product.prod_quantity.toString());
      formData.append('prod_status', product.prod_status);
      
      if (product.originalPrice) formData.append('originalPrice', product.originalPrice.toString());
      if (product.badge) formData.append('badge', product.badge);
      if (product.prod_tag) formData.append('prod_tag', product.prod_tag);
      if (product.prod_gender) formData.append('prod_gender', product.prod_gender);
      if (product.rating) formData.append('rating', product.rating.toString());
      if (product.reviewCount) formData.append('reviewCount', product.reviewCount.toString());
      formData.append('featured', product.featured ? 'true' : 'false');
      
      if (product.prod_photos && product.prod_photos.length > 0) {
        product.prod_photos.forEach((photo) => {
          formData.append('prod_photos', photo);
        });
      }

      // Here you would call your update API with formData
      // const updatedProduct = await updateProductApi(product.id, formData);
      
      const updatedProducts = products.map(p =>
        p.id === product.id ? { ...product, updatedAt: new Date().toISOString() } : p
      );
      setProducts(processProducts(updatedProducts));
      setEditingProduct(null);
      showNotification('success', 'Product updated successfully!');
    } catch (error) {
      showNotification('error', 'Failed to update product');
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    showNotification('success', 'Product deleted successfully!');
  };

  const handleAddProduct = async (product: Product) => {
    try {
      const savedProduct = await addProduct(product);
      const processedProduct = processProducts([savedProduct])[0];
      setProducts((prev) => [...prev, processedProduct]);
      setShowAddProduct(false);
      showNotification("success", "Product added successfully!");
    } catch {
      showNotification("error", "Failed to add product");
    }
  };

  const refreshProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await fetchProductsApi();
      const processedProducts = processProducts(fetchedProducts);
      setProducts(processedProducts);
      showNotification('success', 'Products refreshed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh products';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
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
        prod_images: [],
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

    // Initialize image previews correctly
    const [imagePreviews, setImagePreviews] = useState<string[]>(
      product?.prod_images || []
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.prod_name?.trim()) newErrors.prod_name = 'Product name is required';
      if (!formData.prod_price || formData.prod_price <= 0) newErrors.prod_price = 'Valid price is required';
      if (!formData.brand?.trim()) newErrors.brand = 'Brand is required';
      if (!formData.prod_category) newErrors.prod_category = 'Category is required';
      if (selectedFiles.length === 0 && imagePreviews.length === 0) newErrors.prod_photos = 'At least one product image is required';
      if (formData.prod_quantity === undefined || formData.prod_quantity < 0) newErrors.prod_quantity = 'Valid quantity is required';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      const productData: Product = {
        ...formData,
        prod_name: formData.prod_name!,
        prod_price: formData.prod_price!,
        prod_images: imagePreviews,
        prod_image: imagePreviews[0] || '',
        brand: formData.brand!,
        prod_category: formData.prod_category!,
        prod_description: formData.prod_description || '',
        prod_quantity: formData.prod_quantity || 0,
        featured: formData.featured || false,
        rating: formData.rating || 4.5,
        reviewCount: formData.reviewCount || 0,
        prod_status: formData.prod_status || 'ACTIVE',
        prod_photos: selectedFiles.length > 0 ? selectedFiles : undefined
      } as Product;

      onSave(productData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      
      const validFiles: File[] = [];
      const newErrors = { ...errors };
      delete newErrors.prod_photos;

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setErrors({ ...newErrors, prod_photos: 'Please select valid image files only' });
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...newErrors, prod_photos: 'Each image should be less than 5MB' });
          return;
        }

        validFiles.push(file);
      }

      const totalFiles = [...selectedFiles, ...validFiles];
      if (totalFiles.length > 5) {
        setErrors({ ...newErrors, prod_photos: 'Maximum 5 images allowed' });
        return;
      }

      setSelectedFiles(totalFiles);
      setFormData({ ...formData, prod_photos: totalFiles });

      const newPreviews: string[] = [];
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === validFiles.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      setErrors(newErrors);
    };

    const removeImage = (index: number) => {
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      if (index >= (product?.prod_images?.length || 0)) {
        const newFileIndex = index - (product?.prod_images?.length || 0);
        setSelectedFiles(prev => prev.filter((_, i) => i !== newFileIndex));
      }
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
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={formData.prod_description || ''}
                  onChange={(e) => setFormData({ ...formData, prod_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300 rounded-md resize-none"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Product Images Upload */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Product Images (Max 5)</h4>

              {/* Current Images Display */}
              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Current Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/96x96?text=Error';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              {imagePreviews.length < 5 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Upload Product Images <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors duration-300">
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black"
                        >
                          <span>Upload images</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                      <p className="text-xs text-gray-500">
                        {imagePreviews.length > 0 && `${5 - imagePreviews.length} more images allowed`}
                      </p>
                    </div>
                  </div>
                  
                  {errors.prod_photos && <p className="text-red-500 text-sm mt-1">{errors.prod_photos}</p>}
                </div>
              )}
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

                <div className="flex items-center space-x-3 pt-8">
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

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshProducts}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
        
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshProducts}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-black text-white px-6 py-3 font-medium text-sm tracking-wide hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center space-x-2 uppercase rounded-md"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
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
                <tr key={product.id || product.prod_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="flex -space-x-2">
                          {/* Show primary image with proper error handling */}
                          <img
                            src={product.prod_image || 'https://via.placeholder.com/64x64?text=No+Image'}
                            alt={product.prod_name}
                            className="w-16 h-16 object-cover rounded-md border border-gray-200 z-10 bg-gray-100"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== 'https://via.placeholder.com/64x64?text=No+Image') {
                                target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                              }
                            }}
                          />
                          {/* Show indicator for multiple images */}
                          {product.prod_images && product.prod_images.length > 1 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">
                              +{product.prod_images.length - 1}
                            </div>
                          )}
                        </div>
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.prod_status)}`}
                    >
                      {(product.prod_status ?? "").replace('_', ' ') || "N/A"}
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
                            handleDeleteProduct(product.id || product.prod_id?.toString() || '');
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
              
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Package className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">
                        {products.length === 0 ? 'No products available. Add your first product!' : 'Try adjusting your search or filters'}
                      </p>
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