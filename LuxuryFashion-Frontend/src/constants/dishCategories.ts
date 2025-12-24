// Food Category - Dietary classification (Veg/Non-Veg)
export enum FoodCategory {
  VEG = 'Veg',
  NON_VEG = 'Non-Veg',
}

// Dish Category - Type of dish (Main Course, Starters, etc.)
export enum DishCategory {
  MAIN_COURSE = 'Main Course',
  STARTERS = 'Starters',
  APPETIZERS = 'Appetizers',
  DESSERTS = 'Desserts',
  BEVERAGES = 'Beverages',
  BREADS = 'Breads',
  RICE = 'Rice',
  SOUPS = 'Soups',
  SALADS = 'Salads',
  SOUTH_INDIAN = 'South Indian',
  NORTH_INDIAN = 'North Indian',
  FAST_FOOD = 'Fast Food',
  CHEFS_SPECIAL = "Chef's Special",
}

// Array of all food categories
export const FOOD_CATEGORIES = Object.values(FoodCategory);

// Array of all dish categories
export const DISH_CATEGORIES = Object.values(DishCategory);

// Food category options for select dropdown
export const FOOD_CATEGORY_OPTIONS = FOOD_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

// Dish category options for select dropdown
export const DISH_CATEGORY_OPTIONS = DISH_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

