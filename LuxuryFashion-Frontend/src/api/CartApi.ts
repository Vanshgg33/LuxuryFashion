import axios from 'axios';
import { baseApiUrl } from './base.js';
import type { Cart } from './base.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCart = async (): Promise<Cart> => {
  const response = await axios.get(`${baseApiUrl}/api/cart`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getCartItems = async () => {
  const response = await axios.get(`${baseApiUrl}/api/cart/items`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getCartItem = async (cartItemId: number) => {
  const response = await axios.get(`${baseApiUrl}/api/cart/items/${cartItemId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getCartCount = async (): Promise<number> => {
  const response = await axios.get(`${baseApiUrl}/api/cart/count`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getCartTotal = async (): Promise<number> => {
  const response = await axios.get(`${baseApiUrl}/api/cart/total`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

interface AddToCartRequest {
  productId: number;
  quantity: number;
  price: number;
  size?: string;
}

export const addToCart = async (productId: number, quantity: number = 1, price: number, size?: string): Promise<unknown> => {
  const requestBody: AddToCartRequest = { 
    productId: productId,
    quantity: quantity,
    price: price 
  };
  
  // Include size if provided (required for products with sizes)
  if (size) {
    requestBody.size = size;
  }
  
  const response = await axios.post(
    `${baseApiUrl}/api/cart/add`,
    requestBody,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateCartItem = async (cartItemId: number, quantity: number) => {
  const response = await axios.put(
    `${baseApiUrl}/api/cart/update/${cartItemId}?quantity=${quantity}`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const removeCartItem = async (cartItemId: number) => {
  const response = await axios.delete(
    `${baseApiUrl}/api/cart/remove/${cartItemId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const clearCart = async () => {
  const response = await axios.delete(`${baseApiUrl}/api/cart/clear`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};