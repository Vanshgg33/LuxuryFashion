import axios from 'axios';
import { baseApiUrl, type Gallerydata, type Productdto } from "./base";

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  console.log('Auth token:', token ? 'Present' : 'Missing');
  return token ? { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

export async function addProductApi(formData: FormData): Promise<any> {
  try {
    const response = await axios.post(`${baseApiUrl}/admin-api/add-product`, formData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error("Error in addProductApi:", err);
    throw err;
  }
}

export async function fetchProductsApi(): Promise<Productdto[]> {
  try {
    const response = await axios.get(`${baseApiUrl}/admin-api/fetch-products`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function addGalleryImage(gallery: Gallerydata): Promise<Gallerydata> {
  try {
    const response = await axios.post(`${baseApiUrl}/admin-api/add-gallery-images`, gallery, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error adding gallery image:", error);
    throw error;
  }
}

export async function updateGalleryStatus(galleries: Gallerydata[]): Promise<Gallerydata[]> {
  try {
    const response = await axios.put(`${baseApiUrl}/admin-api/update-gallery-status`, galleries, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating gallery status:", error);
    throw error;
  }
}

export async function fetchGalleryImages(): Promise<Gallerydata[]> {
  try {
    const response = await axios.get(`${baseApiUrl}/admin-api/fetch-gallery-images`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    throw error;
  }
}

export async function updateProductApi(productId: number, dto: Productdto | FormData): Promise<Productdto> {
  const response = await axios.put(`${baseApiUrl}/admin-api/update-product/${productId}`, dto, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function deleteProductApi(productId: number): Promise<void> {
  try {
    await axios.delete(`${baseApiUrl}/admin-api/delete-product/${productId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export const deleteGalleryImage = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${baseApiUrl}/admin-api/delete-gallery-image/${id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    throw error;
  }
};

export const fetchUsersApi = async () => {
  try {
    const response = await axios.get(`${baseApiUrl}/admin-api/users`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUserOrdersApi = async (userId: number) => {
  try {
    const response = await axios.get(`${baseApiUrl}/admin-api/users/${userId}/orders`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const updateUserApi = async (userId: number, userData: any) => {
  try {
    const response = await axios.put(`${baseApiUrl}/admin-api/users/${userId}`, userData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deactivateUserApi = async (userId: number) => {
  try {
    const response = await axios.put(`${baseApiUrl}/admin-api/users/${userId}/deactivate`, {}, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

export const fetchOrdersApi = async () => {
  try {
    console.log('Fetching orders from:', `${baseApiUrl}/api/orders/admin/all`);
    console.log('Headers:', getAuthHeaders());
    const response = await axios.get(`${baseApiUrl}/api/orders/admin/all`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be invalid or expired');
    }
    throw error;
  }
};

export const updateOrderStatusApi = async (orderId: number, status: string) => {
  try {
    const response = await axios.put(`${baseApiUrl}/api/orders/admin/${orderId}/status`, { status }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};