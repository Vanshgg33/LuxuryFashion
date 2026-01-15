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
  inStock?: boolean;
  isBuyOneGetOne?: boolean;
  hasHalfPortion?: boolean;
  halfPortionPrice?: number;
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
    return (data || []).map((d: any, idx: number) => {
      // Extract ID - handle both _id (ObjectId or string) and id fields
      let dishId: string;
      if (d._id) {
        // If _id is an object with toString method (MongoDB ObjectId), convert it
        dishId = typeof d._id === 'string' ? d._id : (d._id.toString ? d._id.toString() : String(d._id));
      } else if (d.id) {
        dishId = typeof d.id === 'string' ? d.id : String(d.id);
      } else {
        console.warn(`Dish at index ${idx} has no ID, skipping`);
        return null;
      }
      
      return {
        id: dishId,
        name: d.name,
        price: d.price,
        category: d.category || d.dishCategory || "Chef's Picks",
        rating: d.rating || 4.6,
        isVeg: d.isVeg ?? (d.foodCategory === 'Veg'),
        image: d.imageUrl || d.image || "/placeholder.svg",
        description: d.description || "Delicious signature from RangeelaDhaba",
        isSpecial: d.isSpecial,
        isTrending: d.isTrending,
        inStock: d.inStock !== undefined ? d.inStock : true,
        isBuyOneGetOne: d.isBuyOneGetOne || false,
        hasHalfPortion: d.hasHalfPortion || false,
        halfPortionPrice: d.halfPortionPrice,
      };
    }).filter((item): item is FoodItem => item !== null);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export { fetchGallery };
