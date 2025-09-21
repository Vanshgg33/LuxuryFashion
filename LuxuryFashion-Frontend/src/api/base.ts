export const baseApiUrl ="https://luxuryfashion-142597902731.asia-south1.run.app";

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
    sizes?: string[];
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
    prod_images: string[];
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
imagenames:string[];
  prod_images: string[];


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

  createdAt?: string;
  updatedAt?: string;

  // For uploads
  prod_photos?: File[];
}
