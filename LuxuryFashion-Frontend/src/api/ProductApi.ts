
import { baseApiUrl, type BackendProduct, type Gallerydata , type Product} from "./base";

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
      image: product.prod_images && product.prod_images.length > 0 
        ? product.prod_images[0] 
        : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      images: product.prod_images || undefined,
      originalPrice: product.selling_price !== product.prod_price ? product.prod_price : undefined,
      badge: product.Badge,
      rating: product.rating,
      quantity: product.prod_quantity, // Add this line - you were missing quantity mapping
      reviewCount: Math.floor(Math.random() * 200) + 50,
      brand: product.prod_brand,
      category: product.prod_category,
      description: product.prod_description,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Gray'],
      inStock: product.prodStatus == 'ACTIVE' && product.prod_quantity > 0, 
      prodStatus: product.prodStatus
    }));
console.log(transformedProducts);
    return transformedProducts;
  } catch (error) {
    
    console.error("Error fetching products:", error);
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
    console.error("Error fetching gallery images:", error);
    throw error;
  }
}

export async function fetchProductsBySelection(
  keyword?: string,
  status: string = "ACTIVE"
): Promise<BackendProduct[]> {
  try {
    const queryParams = new URLSearchParams();
    if (keyword && keyword.trim() !== "") queryParams.append("keyword", keyword);
    if (status) queryParams.append("status", status);

    const url = `${baseApiUrl}/luxuryfashion/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
   
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

