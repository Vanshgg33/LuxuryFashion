import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus, Edit, Trash2, X, Star, Search, Filter, Eye, Package,
  TrendingUp, AlertCircle, CheckCircle, XCircle, Upload, Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { addProductApi, deleteProductApi, fetchProductsApi, updateProductApi } from '../../api/AdminApi';
import type {  Product, Productdto } from '../../api/base';

interface ProductsContextType {
  showNotification: (type: 'success' | 'error' | 'warning', message: string) => void;
}

const addProduct = async (product: Productdto) => {
  try {
    const formData = new FormData();
    formData.append("prod_name", product.prod_name);
    formData.append("prod_price", product.prod_price.toString());
    formData.append("prod_brand", product.prod_brand || "");
    formData.append("prod_category", product.prod_category);
    formData.append("prod_description", product.prod_description || "");
    formData.append("prod_quantity", product.prod_quantity.toString());
    formData.append("prodStatus", product.prodStatus);
    formData.append("selling_price", (product.originalPrice || product.prod_price).toString());
    
    if (product.badge) formData.append("badge", product.badge);
    if (product.prod_tag) formData.append("prod_tag", product.prod_tag);
    if (product.prod_gender) formData.append("prod_gender", product.prod_gender);
    if (product.rating) formData.append("rating", product.rating.toString());
    if (product.reviewCount) formData.append("reviewCount", product.reviewCount.toString());
    formData.append("featured", product.featured ? 'true' : 'false');
    
    // Add image files
    if (product.prod_photos && product.prod_photos.length > 0) {
      product.prod_photos.forEach((photo) => {
        formData.append("prod_photo", photo);
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

  const [products, setProducts] = useState<Productdto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Productdto[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Productdto | null>(null);
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

  const processProducts = (fetchedProducts: Productdto[]): Productdto[] => {
    return fetchedProducts.map(product => {
      // Ensure prod_images is always an array
      let images: string[] = [];
      
      if (product.prod_images && Array.isArray(product.prod_images)) {
        images = product.prod_images;
      } else if (product.prod_images) {
        // If single image exists, convert to array
        images = [product.prod_images];
      }
      
      // Set primary image for backward compatibility
      const primaryImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/300x300?text=No+Image';

      return {
        // Required fields from Productdto interface
        selling_price: Number(product.selling_price) || Number(product.prod_price) || 0,
        imagenames: [], // Initialize empty array for imagenames
        
        // Map backend fields to Productdto
        prod_id: product.prod_id,
        prod_name: product.prod_name,
        prod_price: Number(product.prod_price) || 0,
        originalPrice: Number(product.selling_price) || Number(product.prod_price) || 0,
        brand: product.prod_brand,
        prod_brand: product.prod_brand,
        prod_category: product.prod_category,
        prod_description: product.prod_description,
        prod_quantity: Number(product.prod_quantity) || 0,
        prodStatus: product.prodStatus || 'ACTIVE',
        prod_images: images,
        prod_image: primaryImage,
        rating: Number(product.rating) || 4.5,
        reviewCount: Number(product.reviewCount) || 0,
        prod_tag: product.prod_tag,
        prod_gender: product.prod_gender,
        badge: product.badge,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        
        // Optional fields with default values
        featured: false
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
}, []); 


  // Filter and sort products when dependencies change
  const safeLower = (val?: string | null) => (val ?? "").toLowerCase();

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch =
        safeLower(product.prod_name).includes(searchTerm.toLowerCase()) ||
        safeLower(product.prod_brand).includes(searchTerm.toLowerCase()) ||
        safeLower(product.prod_description).includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || product.prod_category === selectedCategory;
      const matchesStatus = !selectedStatus || product.prodStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

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

  
 const handleEditProduct = async (product: Productdto) => {
  try {
    if (!product.prod_id) {
      throw new Error('Product ID is required for update');
    }

    console.log('Updating product with data:', product);
    
    
    const updateData = {
      ...product,
      
      prod_photos: undefined,
   
      removedImages: product.imagenames || []
    };
    
   
    const updatedBackendProduct = await updateProductApi(product.prod_id, updateData);
    
   
    const updatedProductDto = processProducts([updatedBackendProduct])[0];
    
   
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.prod_id === product.prod_id ? updatedProductDto : p
      )
    );
    
    setEditingProduct(null);
    showNotification('success', 'Product updated successfully!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
    showNotification('error', errorMessage);
    console.error('Error updating product:', error);
  }
};
const handleDeleteProduct = async (id: number) => {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  try {
    await deleteProductApi(id); 
    setProducts(prev => prev.filter(p => p.prod_id !== id));
    showNotification("success", "Product deleted successfully!");
  } catch (error) {
    console.error("Delete failed:", error);
    showNotification("error", "Failed to delete product.");
  }
};

  const handleAddProduct = async (product: Productdto) => {
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
  product?: Productdto | null,
  onSave: (product: Productdto) => void,
  onClose: () => void
}) => {
  const [formData, setFormData] = useState<Partial<Productdto>>(
    product || {
      prod_name: '',
      prod_price: 0,
      originalPrice: 0,
      prod_images: [],
      prod_brand: '',
      prod_category: '',
      prod_description: '',
      prod_quantity: 0,
      featured: false,
      badge: '',
      prod_tag: '',
      prod_gender: '',
      prodStatus: 'ACTIVE',
      rating: 4.5,
      reviewCount: 0
    }
  );

  // Separate states for existing images and new ones
  const [existingImages, setExistingImages] = useState<string[]>(product?.prod_images || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [removedImageNames, setRemovedImageNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---------------------------
  // Remove existing image by index
  const handleRemoveExistingImage = (index: number) => {
    const removed = existingImages[index];
    setExistingImages(existingImages.filter((_, i) => i !== index));
    setRemovedImageNames([...removedImageNames, removed]); // Track removed for backend
  };

  // Remove new image by index
  const handleRemoveNewImage = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // ---------------------------
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prod_name?.trim()) newErrors.prod_name = 'Product name is required';
    if (!formData.prod_price || formData.prod_price <= 0) newErrors.prod_price = 'Valid price is required';
    if (!formData.prod_brand?.trim()) newErrors.brand = 'Brand is required';
    if (!formData.prod_category) newErrors.prod_category = 'Category is required';
    if (selectedFiles.length === 0 && existingImages.length === 0) newErrors.prod_photos = 'At least one product image is required';
    if (formData.prod_quantity === undefined || formData.prod_quantity < 0) newErrors.prod_quantity = 'Valid quantity is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const productData: Productdto = {
      ...formData,
      prod_id: product?.prod_id,
      prod_name: formData.prod_name!,
      prod_price: formData.prod_price!,
      prod_brand: formData.prod_brand!,
      prod_category: formData.prod_category!,
      prod_description: formData.prod_description || '',
      prod_quantity: formData.prod_quantity || 0,
      prodStatus: formData.prodStatus || 'ACTIVE',
      selling_price: formData.originalPrice || formData.prod_price!,
      originalPrice: formData.originalPrice || formData.prod_price!,
      badge: formData.badge,
      prod_tag: formData.prod_tag,
      prod_gender: formData.prod_gender,
      rating: formData.rating || 4.5,
      reviewCount: formData.reviewCount || 0,
      featured: formData.featured || false,
      prod_photos: selectedFiles.length > 0 ? selectedFiles : undefined, // New uploads
      prod_images: existingImages, // Keep only current existing
      removedImages: removedImageNames // Send removed images to backend
    } as Productdto;

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

    // Previews for new uploads
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
      const imageToRemove = imagePreviews[index];
      
      // Check if this is an existing image (not a new upload preview)
      const isExistingImage = product?.prod_images?.includes(imageToRemove) || false;
      
      if (isExistingImage) {
        // Add to removed images list for backend processing
        setRemovedImageNames(prev => [...prev, imageToRemove]);
      }
      
      // Remove from previews
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
      
      // If it's a new file, remove from selected files
      if (!isExistingImage && index >= (product?.prod_images?.length || 0)) {
        const newFileIndex = index - (product?.prod_images?.length || 0);
        setSelectedFiles(prev => prev.filter((_, i) => i !== newFileIndex));
      }
    };

    const handleInputChange = (field: keyof Productdto, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.prod_name || ''}
                  onChange={(e) => handleInputChange('prod_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.prod_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.prod_name && <p className="text-red-500 text-sm mt-1">{errors.prod_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.prod_brand || ''}
                  onChange={(e) => handleInputChange('prod_brand', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter brand name"
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prod_price || ''}
                  onChange={(e) => handleInputChange('prod_price', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.prod_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.prod_price && <p className="text-red-500 text-sm mt-1">{errors.prod_price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice || ''}
                  onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.prod_category || ''}
                  onChange={(e) => handleInputChange('prod_category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.prod_category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.prod_category && <p className="text-red-500 text-sm mt-1">{errors.prod_category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.prod_quantity || ''}
                  onChange={(e) => handleInputChange('prod_quantity', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.prod_quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.prod_quantity && <p className="text-red-500 text-sm mt-1">{errors.prod_quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.prodStatus || 'ACTIVE'}
                  onChange={(e) => handleInputChange('prodStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.prod_gender || ''}
                  onChange={(e) => handleInputChange('prod_gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.prod_description || ''}
                onChange={(e) => handleInputChange('prod_description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description"
              />
            </div>

            {/* Optional Fields */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge
                </label>
                <input
                  type="text"
                  value={formData.badge || ''}
                  onChange={(e) => handleInputChange('badge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., NEW, SALE"
                />
              </div>

             <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Tag
  </label>
  <select
    value={formData.prod_tag || ''}
    onChange={(e) => handleInputChange('prod_tag', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">-- Select Tag --</option>
    <option value="new-arrivals">New</option>
    <option value="popular">Popular</option>
    <option value="sale">Sale</option>
    <option value="all">All</option>
  </select>
</div>


              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured || false}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>

            {/* Images */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Product Images *
  </label>

  {/* Existing Images */}
  {existingImages.length > 0 && (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
      <div className="flex flex-wrap gap-2">
        {existingImages.map((img, index) => (
          <div key={index} className="relative">
            <img
              src={`http://localhost:8081/uploads/${img}`}
              alt={`Image ${index + 1}`}
              className="w-20 h-20 object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => handleRemoveExistingImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full 
                         w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
            <p className="text-xs text-center mt-1">{img}</p>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* New Images */}
  {imagePreviews.length > 0 && (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-2">New Images:</p>
      <div className="flex flex-wrap gap-2">
        {imagePreviews.map((preview, index) => (
          <div key={index} className="relative">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-20 h-20 object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => handleRemoveNewImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full 
                         w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
            <p className="text-xs text-center mt-1">{selectedFiles[index]?.name}</p>
          </div>
        ))}
      </div>
    </div>
  )}



              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
                >
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm">Click to upload images</span>
                  <span className="text-xs text-gray-500 mt-1">Max 5 images, up to 5MB each</span>
                </label>
              </div>
              
              {errors.prod_photos && <p className="text-red-500 text-sm mt-1">{errors.prod_photos}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {product ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshProducts}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="rating">Sort by Rating</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm ${viewMode === 'table' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700'
              } rounded-l-lg transition-colors`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700'
              } rounded-r-lg transition-colors`}
            >
              Grid
            </button>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedStatus('');
              setSortBy('name');
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-4">
            {products.length === 0 
              ? "You haven't added any products yet." 
              : "No products match your current filters."}
          </p>
          {products.length === 0 && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Product
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.prod_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.prod_image || 'https://via.placeholder.com/48x48?text=No+Image'}
                            alt={product.prod_name}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.prod_name}</div>
                          <div className="text-sm text-gray-500">{product.prod_brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.prod_category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.prod_price}</div>
                      {product.originalPrice && product.originalPrice !== product.prod_price && (
                        <div className="text-xs text-gray-500 line-through">₹{product.originalPrice}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getStockColor(product.prod_quantity)}`}>
                        {product.prod_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.prodStatus)}`}>
                        {product.prodStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-900">{product.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({product.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.prod_id!)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Product"
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.prod_id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.prod_image || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={product.prod_name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-semibold rounded">
                    {product.badge}
                  </span>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(product.prodStatus)}`}>
                  {product.prodStatus}
                </span>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.prod_name}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{product.prod_brand}</p>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.prod_description}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">₹{product.prod_price}</span>
                    {product.originalPrice && product.originalPrice !== product.prod_price && (
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${getStockColor(product.prod_quantity)}`}>
                    Stock: {product.prod_quantity}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{product.prod_category}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.prod_id!)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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