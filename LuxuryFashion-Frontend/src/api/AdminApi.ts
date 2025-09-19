



import { baseApiUrl, type Gallerydata, type Productdto } from "./base";

export async function addProductApi(formData: FormData): Promise<any> {
  try {
      const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");

    const response = await fetch(baseApiUrl + "/admin-api/add-product", {
      method: "POST",
      body: formData,
       headers: {
          Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
      throw new Error(`Failed to add product: ${response.statusText}`);
    }

    // Parse the created product from backend
    return await response.json();
  } catch (err) {
    console.error("Error in addProductApi:", err);
    throw err;
  }
}

export async function fetchProductsApi(): Promise<Productdto[]> {
  try {
  const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");
    const response = await fetch(`${baseApiUrl}/admin-api/fetch-products`, {
      method: "GET",
     headers: {
          Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: Productdto[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}


export async function addGalleryImage(gallery: Gallerydata): Promise<Gallerydata> {
  try {  
    
    const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");

    const response = await fetch(`${baseApiUrl}/admin-api/add-gallery-images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(gallery),
   
    });

    if (!response.ok) {
      throw new Error(`Failed to add gallery image: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error adding gallery image:", error);
    throw error;
  }
}


export async function updateGalleryStatus(
  galleries: Gallerydata[]
): Promise<Gallerydata[]> {
  try {

      const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");

    const response = await fetch(`${baseApiUrl}/admin-api/update-gallery-status`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
     
      body: JSON.stringify(galleries),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update gallery status: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating gallery status:", error);
    throw error;
  }
}

export async function fetchGalleryImages(): Promise<Gallerydata[]> {
  try {

      const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");

    const response = await fetch(`${baseApiUrl}/admin-api/fetch-gallery-images`, {
      method: "GET",
        headers: {
        Authorization: `Bearer ${token}`,}
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery images: ${response.status} ${response.statusText}`);
    }

    const images: Gallerydata[] = await response.json();
    return images;
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    throw error;
  }
}


export async function updateProductApi(productId: number, dto: Productdto): Promise<Productdto> {
    const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");

  const response = await fetch(`${baseApiUrl}/admin-api/update-product/${productId}`, {
    
    method: "PUT",
    headers: { "Content-Type": "application/json",Authorization: `Bearer ${token}`, },
    body: JSON.stringify(dto),
    
  });

  if (!response.ok) {
    throw new Error(`Failed to update product: ${response.status}`);
  }

  return response.json();
}




export async function deleteProductApi(productId: number): Promise<void> {

    const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");

  try {
    const response = await fetch(`${baseApiUrl}/admin-api/delete-product/${productId}`, {
      method: "DELETE",
         headers: {
          Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export const deleteGalleryImage = async (id: number): Promise<void> => {
  try {
      const token = sessionStorage.getItem("authToken");
  if (!token) throw new Error("No token found in sessionStorage");


    const response = await fetch(`${baseApiUrl}/admin-api/delete-gallery-image/${id}`, {
      method: 'DELETE',
       headers: {
          Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        errorData?.error || 
        `Failed to delete image: ${response.status} ${response.statusText}`
      );
    }

    // If response has content, you can process it
    // const result = await response.json();
    // return result;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    throw error;
  }
};





