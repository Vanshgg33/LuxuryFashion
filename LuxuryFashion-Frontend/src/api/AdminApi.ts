import axios, { type AxiosError } from 'axios';
import { baseApiUrl, type Gallerydata, type Productdto } from "./base";
import { logger } from '../utils/logger';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 
    Authorization: `Bearer ${token}`
  } : {};
};

const getAuthHeadersWithJson = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

export async function addProductApi(formData: FormData): Promise<Productdto> {
  try {
    const headers = getAuthHeaders();
    
    logger.debug('Adding product via FormData');
    
    const response = await axios.post<Productdto>(`${baseApiUrl}/admin-api/add-product`, formData, {
      headers: headers,
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    logger.error('Error in addProductApi', error, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw error;
  }
}

export async function fetchProductsApi(): Promise<Productdto[]> {
  try {
    const response = await axios.get<Productdto[]>(`${baseApiUrl}/admin-api/fetch-products`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    logger.error("Error fetching products", error);
    throw error;
  }
}

export async function addGalleryImage(gallery: Gallerydata): Promise<Gallerydata> {
  try {
    const response = await axios.post<Gallerydata>(`${baseApiUrl}/admin-api/add-gallery-images`, gallery, {
      headers: getAuthHeadersWithJson(),
    });
    return response.data;
  } catch (error) {
    logger.error("Error adding gallery image", error);
    throw error;
  }
}

export async function updateGalleryStatus(galleries: Gallerydata[]): Promise<Gallerydata[]> {
  try {
    const response = await axios.put<Gallerydata[]>(`${baseApiUrl}/admin-api/update-gallery-status`, galleries, {
      headers: getAuthHeadersWithJson(),
    });
    return response.data;
  } catch (error) {
    logger.error("Error updating gallery status", error);
    throw error;
  }
}

export async function fetchGalleryImages(): Promise<Gallerydata[]> {
  try {
    const response = await axios.get<Gallerydata[]>(`${baseApiUrl}/admin-api/fetch-gallery-images`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    logger.error("Error fetching gallery images", error);
    throw error;
  }
}

export async function updateProductApi(productId: number, dto: Productdto | FormData): Promise<Productdto> {
  try {
    const headers = dto instanceof FormData 
      ? getAuthHeaders() 
      : getAuthHeadersWithJson();
    
    logger.debug(`Updating product ${productId}`, { 
      isFormData: dto instanceof FormData 
    });
    
    const response = await axios.put<Productdto>(`${baseApiUrl}/admin-api/update-product/${productId}`, dto, {
      headers: headers,
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ error?: string }>;
    logger.error(`Error in updateProductApi for product ${productId}`, error, {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

export async function deleteProductApi(productId: number): Promise<void> {
  try {
    await axios.delete(`${baseApiUrl}/admin-api/delete-product/${productId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    logger.error(`Error deleting product ${productId}`, error);
    throw error;
  }
}

export const deleteGalleryImage = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${baseApiUrl}/admin-api/delete-gallery-image/${id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    logger.error(`Error deleting gallery image ${id}`, error);
    throw error;
  }
};

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  role: string;
  active: boolean;
  createdAt: string;
  dateOfBirth?: string;
}

export const fetchUsersApi = async (): Promise<AdminUser[]> => {
  try {
    const response = await axios.get<AdminUser[]>(`${baseApiUrl}/admin-api/users`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching users', error);
    throw error;
  }
};

export const fetchUserOrdersApi = async (userId: number): Promise<unknown> => {
  try {
    const response = await axios.get(`${baseApiUrl}/admin-api/users/${userId}/orders`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    logger.error(`Error fetching user orders for user ${userId}`, error);
    throw error;
  }
};

export const updateUserApi = async (userId: number, userData: Record<string, unknown>): Promise<unknown> => {
  try {
    const response = await axios.put(`${baseApiUrl}/admin-api/users/${userId}`, userData, {
      headers: getAuthHeadersWithJson(),
    });
    return response.data;
  } catch (error) {
    logger.error(`Error updating user ${userId}`, error);
    throw error;
  }
};

export const deactivateUserApi = async (userId: number): Promise<unknown> => {
  try {
    const response = await axios.put(`${baseApiUrl}/admin-api/users/${userId}/deactivate`, {}, {
      headers: getAuthHeadersWithJson(),
    });
    return response.data;
  } catch (error) {
    logger.error(`Error deactivating user ${userId}`, error);
    throw error;
  }
};

export interface AdminOrder {
  id: number;
  user: {
    id: number;
    username?: string;
    name?: string;
    email: string;
    phoneNumber?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  items: Array<{
    id: number;
    product: {
      prod_id: number;
      prod_name: string;
      prod_price: number;
      selling_price: number;
      prod_brand: string;
      prod_category: string;
      imageUrl?: string;
    };
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  orderDate: string;
  status: string;
  paymentStatus?: 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paymentBank?: string;
  paymentWallet?: string;
  paymentVpa?: string;
  paidAt?: string;
  paymentFailureReason?: string;
}

export const fetchOrdersApi = async (): Promise<AdminOrder[]> => {
  try {
    const response = await axios.get<AdminOrder[]>(`${baseApiUrl}/api/orders/admin/all`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    logger.error('Error fetching orders', axiosError, {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    });
    if (axiosError.response?.status === 401) {
      logger.warn('Authentication failed - token may be invalid or expired');
    }
    throw axiosError;
  }
};

export const updateOrderStatusApi = async (orderId: number, status: string): Promise<unknown> => {
  try {
    const response = await axios.put(`${baseApiUrl}/api/orders/admin/${orderId}/status`, { status }, {
      headers: getAuthHeadersWithJson(),
    });
    return response.data;
  } catch (error) {
    logger.error(`Error updating order status for order ${orderId}`, error);
    throw error;
  }
};

export const fetchAnalyticsApi = async (): Promise<{ orders: AdminOrder[]; users: unknown[]; products: Productdto[] }> => {
  try {
    const [orders, users, products] = await Promise.all([
      fetchOrdersApi(),
      fetchUsersApi(),
      fetchProductsApi()
    ]);
    return { orders, users, products };
  } catch (error) {
    logger.error('Error fetching analytics data', error);
    throw error;
  }
};