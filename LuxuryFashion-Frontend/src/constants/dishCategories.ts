// Food Category - Dietary classification (Veg/Non-Veg)
export enum FoodCategory {
  VEG = 'Veg',
  NON_VEG = 'Non-Veg',
}

// Dish Category - Type of dish based on Rangeela Dhaba menu
export enum DishCategory {
  HAKKA_NOODLES = 'Hakka Noodles',
  VEG_STARTERS = 'Veg Starters',
  NON_VEG_STARTERS = 'Non Veg Starters',
  SALAD_RAITA = 'Salad & Raita',
  CHINESE_VEG = 'Chinese Veg',
  CHINESE_NON_VEG = 'Chinese Non Veg',
  BIRYANI = 'Biryani',
  FRIED_RICE_PULAO = 'Fried Rice & Pulao',
  VEG_MAIN_COURSE = 'Veg Main Course',
  NON_VEG_MAIN_COURSE = 'Non Veg Main Course',
  MUGHLAI = 'Mughlai',
  ROTI_PARATHA = 'Roti & Paratha',
  TANDOORI = 'Tandoori',
  TADKA = 'Tadka',
  DESSERTS_BEVERAGES = 'Desserts & Beverages',
  DOSA = 'Dosa',
  IDLI_VADA = 'Idli Vada',
  UTTAPAM = 'Uttapam',
  JUICE = 'Juice',
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
