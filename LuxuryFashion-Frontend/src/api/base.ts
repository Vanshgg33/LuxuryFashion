import { config } from '../config/env';

export const baseApiUrl = config.apiUrl;
export const OAUTH_LOGIN_URL = config.oauthLoginUrl;

export interface CartItem {
  id: number;
  cartItemId?: number;
  productId: number;
  quantity: number;
  size?: string; // Size selected for this cart item
  product: {
    prod_id: number;
    prod_name: string;
    prod_price: number;
    selling_price: number;
    imagenames: string[];
    prod_brand: string;
  };
}

export interface Cart {
  cartItems: CartItem[];
  items?: CartItem[];
  totalPrice: number;
  totalAmount?: number;
  totalItems: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    originalPrice?: number;
    quantity?: number;
    badge?: string;
    rating?: number;
    reviewCount?: number;
    brand?: string;
    category?: string;
    description?: string;
    sizes?: Record<string, number>; // Changed from string[] to Record<string, number> e.g., { "S": 10, "M": 15 }
    reservedSizes?: Record<string, number>; // Items currently in carts e.g., { "S": 2 }
    colors?: string[];
    inStock?: boolean;
    prodStatus: string;
}

export interface BackendProduct {
    prod_id: number;
    prod_name: string;
    prod_brand: string;
    prod_description: string;
    prod_price: number;
    prod_quantity: number;
    selling_price: number;
    prod_category: string;
    prod_tag: string;
    prod_gender: string;
    prodStatus: string;
    imagenames: string[];
    sizes?: Record<string, number>; // Size quantities e.g., { "S": 10, "M": 15 }
    reservedSizes?: Record<string, number>; // Items in carts e.g., { "S": 2 }
    rating?: number;
    reviewCount?: number;
    createdAt: string;
    updatedAt: string;
    Badge?: string;
}

export interface Gallerydata {
  gallery_id: number;       
  title?: string;
  imageUrl: string;
  active: boolean;
}

export interface Productdto {
  selling_price: number;
  id?: number;
  prod_id?: number;
  prod_name: string;
  prod_price: number;
  originalPrice?: number;

   prod_brand: string;
  prod_image?: string;
  imagenames: string[];

  prod_category: string;
  prod_quantity: number;
  prod_description: string;
 prodStatus: string;
  prod_tag?: string;
  prod_gender?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  sizes?: Record<string, number>; // Size quantities e.g., { "S": 10, "M": 15 }
  createdAt?: string;
  updatedAt?: string;

  // For uploads
  prod_photos?: File[];
  removedImages?: string[];
}
