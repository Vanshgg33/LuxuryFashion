import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Camera, Eye, Trash2, Save, X } from 'lucide-react';
import type { GalleryImage } from '../../api/ProductCart';

interface GalleryContextType {
  showNotification: (type: 'success' | 'error', message: string) => void;
}

const Gallery: React.FC = () => {
  const { showNotification } = useOutletContext<GalleryContextType>();
  
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
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Gallery Image 1',
      category: 'gallery',
      active: true
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Gallery Image 2',
      category: 'gallery',
      active: false
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Banner Image 1',
      category: 'banner',
      active: true
    }
  ]);

  const [showAddImage, setShowAddImage] = useState(false);
  const [newImage, setNewImage] = useState<Partial<GalleryImage>>({
    url: '',
    title: '',
    category: 'hero',
    active: true
  });

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
    const image = galleryImages.find(img => img.id === id);
    showNotification('success', `Image ${image?.active ? 'deactivated' : 'activated'} successfully!`);
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

  const getCategoryStats = (category: GalleryImage['category']) => {
    const categoryImages = galleryImages.filter(img => img.category === category);
    return {
      total: categoryImages.length,
      active: categoryImages.filter(img => img.active).length
    };
  };

  return (
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

      {/* Gallery Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['hero', 'gallery', 'banner'] as const).map((category) => {
          const stats = getCategoryStats(category);
          return (
            <div key={category} className="bg-white p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-medium text-gray-900 capitalize">{category} Images</h3>
                <span className="text-sm text-gray-500">{stats.active}/{stats.total} active</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Images:</span>
                  <span className="font-medium text-gray-900">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Images:</span>
                  <span className="font-medium text-green-600">{stats.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(['hero', 'gallery', 'banner'] as const).map((category) => (
          <div key={category} className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-serif font-medium text-gray-900 capitalize">
                {category} Images ({galleryImages.filter(img => img.category === category).length})
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {galleryImages
                  .filter(img => img.category === category)
                  .map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-48 object-cover border border-gray-200 rounded"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 rounded">
                        <button
                          onClick={() => toggleImageStatus(image.id)}
                          className={`p-2 rounded-full ${image.active ? 'bg-green-500' : 'bg-gray-500'} text-white hover:scale-110 transition-transform duration-200`}
                          title={image.active ? 'Deactivate' : 'Activate'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform duration-200"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900">{image.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            image.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {image.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{image.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                {galleryImages.filter(img => img.category === category).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No {category} images yet</p>
                    <p className="text-sm">Add some images to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Image Modal */}
      {showAddImage && <ImageModal />}
    </div>
  );
};

export default Gallery;