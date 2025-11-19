
import { baseApiUrl, type BackendProduct, type Gallerydata , type Product} from "./base";
import { logger } from '../utils/logger';

export async function fetchProductsshop(): Promise<Product[]> {
  try {
    const response = await fetch(`${baseApiUrl}/luxuryfashion/fetch-products-shop`, {
      method: "GET",
     
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: BackendProduct[] = await response.json();
    
    // Transform backend data to frontend format
    const transformedProducts: Product[] = data.map(product => ({
      id: product.prod_id.toString(),
      name: product.prod_name,
      price: product.selling_price || product.prod_price,
      image: product.imagenames && product.imagenames.length > 0 
        ? product.imagenames[0] 
        : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      images: product.imagenames || undefined,
      originalPrice: product.selling_price !== product.prod_price ? product.prod_price : undefined,
      badge: product.Badge,
      rating: product.rating,
      quantity: product.prod_quantity,
      reviewCount: product.reviewCount || Math.floor(Math.random() * 200) + 50,
      brand: product.prod_brand,
      category: product.prod_category,
      description: product.prod_description,
      sizes: product.sizes || undefined, // Use actual sizes from backend
      reservedSizes: product.reservedSizes || undefined, // Reserved sizes from backend
      colors: ['Black', 'Navy', 'Gray'],
      inStock: product.prodStatus == 'ACTIVE' && (product.sizes ? Object.values(product.sizes).some(qty => qty > 0) : product.prod_quantity > 0), 
      prodStatus: product.prodStatus
    }));
    return transformedProducts;
  } catch (error) {
    logger.error("Error fetching products", error);
    throw error;
  }
}



export async function fetchGalleryImages(): Promise<Gallerydata[]> {
  try {
    const response = await fetch(`${baseApiUrl}/luxuryfashion/fetch-gallery`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
     
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery images: ${response.status} ${response.statusText}`);
    }

    return await response.json(); 
  } catch (error) {
    logger.error("Error fetching gallery images", error);
    throw error;
  }
}

export async function fetchProductsall(): Promise<BackendProduct[]> {
  try {
    const url = `${baseApiUrl}/luxuryfashion/products`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error fetching products", error);
    throw error;
  }
}


