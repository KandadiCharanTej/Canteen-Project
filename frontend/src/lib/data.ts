export type Category = { id: string; name: string; emoji: string };

export type Food = {
  id: string;
  name: string;
  price: number;
  category: string;
  veg: boolean;
  emoji: string;
  image: string;
  inStock: boolean;
  rating?: number;
  tag?: string;
};

export const categories: Category[] = [
  { id: "all", name: "All", emoji: "🍽️" },
  { id: "meals", name: "Meals", emoji: "🍱" },
  { id: "snacks", name: "Snacks", emoji: "🥪" },
  { id: "drinks", name: "Drinks", emoji: "🥤" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
  { id: "fastfood", name: "Fast Food", emoji: "🍔" },
];

const img = (q: string) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=600&q=70`;

export const foods: Food[] = [
  {
    id: "f1",
    name: "Veg Thali",
    price: 80,
    category: "meals",
    veg: true,
    emoji: "🍛",
    image: img("photo-1546833999-b9f581a1996d"),
    inStock: true,
    rating: 4.5,
    tag: "Bestseller",
  },
  {
    id: "f2",
    name: "Chicken Biryani",
    price: 140,
    category: "meals",
    veg: false,
    emoji: "🍗",
    image: img("photo-1563379091339-03b21ab4a4f8"),
    inStock: true,
    rating: 4.7,
    tag: "Popular",
  },
  {
    id: "f3",
    name: "Masala Dosa",
    price: 60,
    category: "meals",
    veg: true,
    emoji: "🥞",
    image: img("photo-1668236543090-82eba5ee5976"),
    inStock: true,
    rating: 4.6,
  },
  {
    id: "f4",
    name: "Paneer Roll",
    price: 70,
    category: "snacks",
    veg: true,
    emoji: "🌯",
    image: img("photo-1626700051175-6818013e1d4f"),
    inStock: true,
  },
  {
    id: "f5",
    name: "Veg Sandwich",
    price: 45,
    category: "snacks",
    veg: true,
    emoji: "🥪",
    image: img("photo-1539252554453-80ab65ce3586"),
    inStock: true,
  },
  {
    id: "f6",
    name: "Samosa (2pc)",
    price: 25,
    category: "snacks",
    veg: true,
    emoji: "🥟",
    image: img("photo-1601050690597-df0568f70950"),
    inStock: false,
  },
  {
    id: "f7",
    name: "Cold Coffee",
    price: 50,
    category: "drinks",
    veg: true,
    emoji: "☕",
    image: img("photo-1461023058943-07fcbe16d735"),
    inStock: true,
    tag: "New",
  },
  {
    id: "f8",
    name: "Fresh Lime Soda",
    price: 35,
    category: "drinks",
    veg: true,
    emoji: "🥤",
    image: img("photo-1437418747212-8d9709afab22"),
    inStock: true,
  },
  {
    id: "f9",
    name: "Chocolate Brownie",
    price: 55,
    category: "desserts",
    veg: true,
    emoji: "🍫",
    image: img("photo-1606313564200-e75d5e30476c"),
    inStock: true,
  },
  {
    id: "f10",
    name: "Gulab Jamun (2pc)",
    price: 30,
    category: "desserts",
    veg: true,
    emoji: "🍯",
    image: img("photo-1601303516534-bf9f55389acc"),
    inStock: true,
  },
  {
    id: "f11",
    name: "Cheese Burger",
    price: 90,
    category: "fastfood",
    veg: true,
    emoji: "🍔",
    image: img("photo-1568901346375-23c9450c58cd"),
    inStock: true,
    rating: 4.4,
  },
  {
    id: "f12",
    name: "Veg Pizza Slice",
    price: 75,
    category: "fastfood",
    veg: true,
    emoji: "🍕",
    image: img("photo-1565299624946-b28f40a0ae38"),
    inStock: true,
  },
  {
    id: "f13",
    name: "French Fries",
    price: 60,
    category: "fastfood",
    veg: true,
    emoji: "🍟",
    image: img("photo-1573080496219-bb080dd4f877"),
    inStock: true,
  },
  {
    id: "f14",
    name: "Chicken Roll",
    price: 85,
    category: "snacks",
    veg: false,
    emoji: "🌯",
    image: img("photo-1626700051175-6818013e1d4f"),
    inStock: true,
  },
  {
    id: "f15",
    name: "Iced Tea",
    price: 30,
    category: "drinks",
    veg: true,
    emoji: "🧋",
    image: img("photo-1556679343-c7306c1976bc"),
    inStock: true,
  },
];

export const pickupSlots = {
  morning: [
    "9:00 AM",
    "9:20 AM",
    "9:40 AM",
    "10:00 AM",
    "10:20 AM",
    "10:40 AM",
    "11:00 AM",
    "11:20 AM",
    "11:40 AM",
    "12:00 PM",
    "12:20 PM",
  ],
  lunch: ["12:40 PM", "1:00 PM", "1:20 PM", "1:30 PM"],
  afternoon: [
    "2:00 PM",
    "2:20 PM",
    "2:40 PM",
    "3:00 PM",
    "3:20 PM",
    "3:40 PM",
    "4:00 PM",
    "4:20 PM",
    "4:40 PM",
    "4:50 PM",
  ],
};
