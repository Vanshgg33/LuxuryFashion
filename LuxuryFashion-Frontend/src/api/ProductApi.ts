
import { baseApiUrl, type BackendProduct, type Gallerydata , type Product} from "./base";
import { logger } from '../utils/logger';
import { apiCache, CACHE_KEYS } from '../utils/apiCache';

export async function fetchProductsshop(): Promise<Product[]> {
  // Check cache first
  const cached = apiCache.get<Product[]>(CACHE_KEYS.PRODUCTS_SHOP);
  if (cached) {
    logger.debug('Returning cached products');
    return cached;
  }

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
    
    // Cache the transformed products for 5 minutes
    apiCache.set(CACHE_KEYS.PRODUCTS_SHOP, transformedProducts, 5 * 60 * 1000);
    
    return transformedProducts;
  } catch (error) {
    logger.error("Error fetching products", error);
    throw error;
  }
}



export async function fetchGalleryImages(): Promise<Gallerydata[]> {
  // Check cache first
  const cached = apiCache.get<Gallerydata[]>(CACHE_KEYS.GALLERY_IMAGES);
  if (cached) {
    logger.debug('Returning cached gallery images');
    return cached;
  }

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

    const data = await response.json();
    
    // Cache gallery images for 10 minutes (they change less frequently)
    apiCache.set(CACHE_KEYS.GALLERY_IMAGES, data, 10 * 60 * 1000);
    
    return data; 
  } catch (error) {
    logger.error("Error fetching gallery images", error);
    throw error;
  }
}

export async function fetchProductsall(): Promise<BackendProduct[]> {
  // Check cache first
  const cached = apiCache.get<BackendProduct[]>(CACHE_KEYS.PRODUCTS_ALL);
  if (cached) {
    logger.debug('Returning cached all products');
    return cached;
  }

  try {
    const url = `${baseApiUrl}/luxuryfashion/products`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache all products for 5 minutes
    apiCache.set(CACHE_KEYS.PRODUCTS_ALL, data, 5 * 60 * 1000);
    
    return data;
  } catch (error) {
    logger.error("Error fetching products", error);
    throw error;
  }
}


