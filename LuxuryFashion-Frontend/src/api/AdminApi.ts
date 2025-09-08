

import type { Product } from "../components/Admin/Products";
import { baseApiUrl } from "./base";


export async function addProductApi(product: Product): Promise<any> {
  try {
    console.log("Adding product:", product);

    const response = await fetch(baseApiUrl + "/admin-api/add-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // needed for cookies/session
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      console.log("Response not ok:", response);
      throw new Error(`Failed to add product: ${response.status}`);
    }

    // return backend response
    const data = await response.json();
    console.log("Product added successfully!", data);
    return data;

  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

