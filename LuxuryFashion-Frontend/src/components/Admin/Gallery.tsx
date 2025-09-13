import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Camera, Eye, Trash2, Save, X } from 'lucide-react';
import { addGalleryImage, deleteGalleryImage, fetchGalleryImages, updateGalleryStatus } from '../../api/AdminApi';
import type { Gallerydata } from '../../api/base'; 

interface GalleryContextType {
  showNotification: (type: 'success' | 'error', message: string) => void;
}

const Gallery: React.FC = () => {
  const { showNotification } = useOutletContext<GalleryContextType>();
  
  const [galleryImages, setGalleryImages] = useState<Gallerydata[]>([]);
  const [showAddImage, setShowAddImage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newImage, setNewImage] = useState<Partial<Gallerydata>>({
    imageUrl: '',
    title: '',
    active: true
  });

  const MAX_ACTIVE_IMAGES = 4;

  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        const images = await fetchGalleryImages();
        console.log('Fetched images:', images);
        console.log('Image IDs:', images.map(img => img.gallery_id));
        
        // Check for duplicate IDs
        const ids = images.map(img => img.gallery_id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
          console.error('Duplicate IDs found:', duplicateIds);
        }
        
        setGalleryImages(images);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        showNotification('error', 'Failed to fetch gallery images');
      }
    };
    loadGalleryImages();
  }, [showNotification]);

  const handleAddImage = async () => {
    if (!newImage.imageUrl || !newImage.title) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    try {
      const galleryData: Gallerydata = {
        title: newImage.title!,
        imageUrl: newImage.imageUrl!,
        active: newImage.active || true,
        gallery_id: 0
      };

      // call backend
      const savedImage = await addGalleryImage(galleryData);
      console.log('Added new image:', savedImage);

      setGalleryImages(prevImages => [...prevImages, savedImage]);

      setNewImage({
        imageUrl: "",
        title: "",
        active: true,
      });
      setShowAddImage(false);
      showNotification("success", "Image added successfully!");
    } catch (error) {
      console.error('Error adding image:', error);
      showNotification("error", "Failed to add image");
    }
  };

  const handleDeleteImage = async (id: number) => {
    console.log('Deleting image with ID:', id);
    
    if (!id) {
      console.error('No ID provided for deletion');
      showNotification('error', 'Invalid image ID');
      return;
    }

    try {

      await deleteGalleryImage(id);
      
 
      setGalleryImages(prevImages => {
        console.log('Images before deletion:', prevImages.map(img => ({ id: img.gallery_id, title: img.title })));
        const updatedImages = prevImages.filter(img => img.gallery_id !== id);
        console.log('Images after deletion:', updatedImages.map(img => ({ id: img.gallery_id, title: img.title })));
        return updatedImages;
      });
      
      showNotification('success', 'Image deleted successfully!');
      // Note: No need to set hasUnsavedChanges since deletion is immediate
    } catch (error) {
      console.error('Error deleting image:', error);
      showNotification('error', 'Failed to delete image');
    }
  };

  const handleCheckboxChange = (id: number) => {
    console.log('Changing image with ID:', id);
    
    if (!id) {
      console.error('No ID provided for status change');
      showNotification('error', 'Invalid image ID');
      return;
    }
    
    setGalleryImages(prevImages => {
      console.log('Current images before change:', prevImages.map(img => ({ id: img.gallery_id, active: img.active, title: img.title })));
      
      const targetImage = prevImages.find(img => img.gallery_id === id);
      if (!targetImage) {
        console.error('Target image not found for ID:', id);
        return prevImages;
      }
      
      const currentActiveCount = prevImages.filter(img => img.active).length;
      
      if (!targetImage.active && currentActiveCount >= MAX_ACTIVE_IMAGES) {
        showNotification('error', `Maximum ${MAX_ACTIVE_IMAGES} images can be active at once`);
        return prevImages;
      }
      
      const updatedImages = prevImages.map(img => {
        if (img.gallery_id === id) {
          console.log(`Toggling image ${id} from ${img.active} to ${!img.active}`);
          return { ...img, active: !img.active };
        }
        return img;
      });
      
      console.log('Images after change:', updatedImages.map(img => ({ id: img.gallery_id, active: img.active, title: img.title })));
      return updatedImages;
    });
    
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      await updateGalleryStatus(galleryImages);
      setHasUnsavedChanges(false);
      showNotification('success', 'Gallery status updated successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      showNotification('error', 'Failed to update gallery status');
    }
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
              value={newImage.imageUrl || ''}
              onChange={(e) => setNewImage({...newImage, imageUrl: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors duration-300"
              placeholder="https://example.com/image.jpg"
            />
            {newImage.imageUrl && (
              <div className="mt-4">
                <img src={newImage.imageUrl} alt="Preview" className="w-full h-48 object-cover border border-gray-200" />
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

  const getTotalStats = () => {
    return {
      total: galleryImages.length,
      active: galleryImages.filter(img => img.active).length
    };
  };

  const getActiveCount = () => galleryImages.filter(img => img.active).length;

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
      <div className="bg-white p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-medium text-gray-900">Gallery Statistics</h3>
          <span className="text-sm text-gray-500">{getTotalStats().active}/{getTotalStats().total} active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Images:</span>
              <span className="font-medium text-gray-900">{getTotalStats().total}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Images:</span>
              <span className="font-medium text-green-600">{getTotalStats().active}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Inactive Images:</span>
              <span className="font-medium text-red-600">{getTotalStats().total - getTotalStats().active}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${getTotalStats().total > 0 ? (getTotalStats().active / getTotalStats().total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Active Images Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium text-gray-900">
            Active Images: {getActiveCount()}/{MAX_ACTIVE_IMAGES}
          </span>
          {getActiveCount() >= MAX_ACTIVE_IMAGES && (
            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Maximum limit reached
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Image Grid */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-serif font-medium text-gray-900">
            All Images ({galleryImages.length})
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image) => {
              // Add validation to ensure we have a valid ID
              if (!image.gallery_id) {
                console.error('Image missing gallery_id:', image);
                return null;
              }
              
              return (
                <div key={`image-${image.gallery_id}`} className="relative group">
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={image.title || 'Gallery image'}
                      className="w-full h-full object-cover border border-gray-200 rounded"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 rounded">
                    <button
                      onClick={() => {
                        console.log('Toggle button clicked for image ID:', image.gallery_id);
                        handleCheckboxChange(image.gallery_id);
                      }}
                      className={`p-2 rounded-full ${image.active ? 'bg-green-500' : 'bg-gray-500'} text-white hover:scale-110 transition-transform duration-200`}
                      title={image.active ? 'Deactivate' : 'Activate'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        console.log('Delete button clicked for image ID:', image.gallery_id);
                        handleDeleteImage(image.gallery_id);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform duration-200"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">{image.title || 'Untitled'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        image.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {image.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">ID: {image.gallery_id}</span>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)} {/* Remove any null entries */}
            
            {galleryImages.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No images yet</p>
                <p className="text-sm">Add some images to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleSaveChanges}
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-300 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      )}

      {/* Add Image Modal */}
      {showAddImage && <ImageModal />}
    </div>
  );
};

export default Gallery;