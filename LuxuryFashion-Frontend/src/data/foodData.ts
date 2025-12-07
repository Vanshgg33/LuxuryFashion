export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  isVeg: boolean;
  image: string;
  description: string;
  ingredients?: string[];
  isSpecial?: boolean;
  isTrending?: boolean;
}

export const categories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "Veg", name: "Veg", icon: "🥬" },
  { id: "Non-Veg", name: "Non-Veg", icon: "🍗" },
  { id: "South Indian", name: "South Indian", icon: "🥘" },
  { id: "Fast Food", name: "Fast Food", icon: "🍔" },
  { id: "Desserts", name: "Desserts", icon: "🍰" },
  { id: "Beverages", name: "Beverages", icon: "🥤" },
];

export const specialOffers = [
  {
    id: "offer1",
    title: "50% OFF on First Order",
    description: "Use code WELCOME50",
    bgColor: "from-primary/20 to-accent/20",
  },
  {
    id: "offer2",
    title: "Free Delivery Today",
    description: "On orders above ₹299",
    bgColor: "from-sage/20 to-cream/20",
  },
  {
    id: "offer3",
    title: "Buy 2 Get 1 Free",
    description: "On all desserts",
    bgColor: "from-terracotta/20 to-primary/20",
  },
];

// API-backed helpers
import { fetchProducts as _fetchProducts, fetchGallery } from "@/lib/api";

export async function fetchProducts(): Promise<FoodItem[]> {
  try {
    const data = await _fetchProducts();
    // If backend returns Product objects with different keys, adapt here if needed
    return data as FoodItem[];
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export { fetchGallery };
