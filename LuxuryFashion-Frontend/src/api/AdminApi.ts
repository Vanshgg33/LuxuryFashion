


import type { Product } from "../components/Admin/Products";
import { baseApiUrl } from "./base";

export async function addProductApi(formData: FormData): Promise<any> {
  try {
    const response = await fetch(baseApiUrl + "/admin-api/add-product", {
      method: "POST",
      body: formData,
      credentials: "include",
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

export async function fetchProductsApi(): Promise<Product[]> {
  try {
    const response = await fetch(`${baseApiUrl}/admin-api/fetch-products`, {
      method: "GET",
      credentials: "include", // keep cookies/session if needed
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: Product[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

