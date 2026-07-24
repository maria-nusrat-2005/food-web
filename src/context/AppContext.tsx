'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Food, Category, Notification, Reservation } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  foods: Food[];
  categories: Category[];
  favorites: string[]; // food ids
  notifications: Notification[];
  loading: boolean;
  isSupabaseConnected: boolean;
  toggleFavorite: (foodId: string) => void;
  isFavorite: (foodId: string) => boolean;
  addNotification: (title: string, message: string) => void;
  markNotificationsAsRead: () => void;
  createReservation: (name: string, phone: string, guests: number, date: string, time: string) => Promise<boolean>;
  getReservations: () => Reservation[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'appetizer', icon: 'Pizza' },
  { id: '2', name: 'main', icon: 'Pizza' },
  { id: '3', name: 'bangladeshi', icon: 'Layers' },
  { id: '4', name: 'fastfood', icon: 'Pizza' },
  { id: '5', name: 'seafood', icon: 'Pizza' },
  { id: '6', name: 'dessert', icon: 'Coffee' },
  { id: '7', name: 'drinks', icon: 'Wine' },
];

const MOCK_FOODS: Food[] = [
  // 1. Appetizers
  { id: 'ap1', title: 'French Fries', description: 'Crispy golden French fries seasoned with salt and spices.', price: 150, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6, calories: 312, cook_time: 10, stock: 50, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: 'ap2', title: 'Chicken Wings', description: 'Deep fried crispy chicken wings tossed in spicy buffalo sauce.', price: 350, discount_price: 320, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 450, cook_time: 12, stock: 45, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 2 },
  { id: 'ap3', title: 'Spring Rolls', description: 'Crispy fried rolls filled with fresh sautéed vegetables.', price: 180, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.4, calories: 220, cook_time: 8, stock: 40, featured: false, is_veg: true, is_vegan: true, is_gluten_free: false, spicy_level: 0 },
  { id: 'ap4', title: 'Garlic Bread', description: 'Toasted baguette slices brushed with garlic butter and herbs.', price: 120, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.5, calories: 180, cook_time: 6, stock: 60, featured: false, is_veg: true, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'ap5', title: 'Soup', description: 'Warm, comforting vegetable broth soup with rich herbs.', price: 200, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.5, calories: 150, cook_time: 10, stock: 30, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: 'ap6', title: 'Salad', description: 'Fresh garden greens with cucumbers, tomatoes, and olive oil dressing.', price: 220, discount_price: 200, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 120, cook_time: 5, stock: 40, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },

  // 2. Main Courses
  { id: 'mc1', title: 'Fried Rice', description: 'Classic wok-tossed jasmine rice with vegetables and light soy.', price: 300, discount_price: null, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6, calories: 550, cook_time: 12, stock: 40, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'mc2', title: 'Biryani', description: 'Aromatic basmati rice cooked with rich local spices and mutton.', price: 450, discount_price: 400, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9, calories: 750, cook_time: 15, stock: 35, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 1 },
  { id: 'mc3', title: 'Pizza', description: 'Hand-tossed crust topped with rich marinara sauce and mozzarella.', price: 800, discount_price: null, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 950, cook_time: 20, stock: 30, featured: true, is_veg: true, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'mc4', title: 'Classic Burger', description: 'Beef patty loaded with melted cheese, lettuce, and pickles.', price: 350, discount_price: null, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 650, cook_time: 12, stock: 45, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'mc5', title: 'Pasta', description: 'Penne pasta tossed in a creamy, velvety white sauce with garlic.', price: 400, discount_price: 360, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6, calories: 580, cook_time: 15, stock: 35, featured: false, is_veg: true, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'mc6', title: 'Sandwich', description: 'Grilled club sandwich loaded with layers of cheese and vegetables.', price: 250, discount_price: null, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.5, calories: 420, cook_time: 8, stock: 50, featured: false, is_veg: true, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'mc7', title: 'Steak', description: 'Premium ribeye steak grilled to order, served with garlic mash.', price: 1200, discount_price: 1100, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9, calories: 850, cook_time: 22, stock: 15, featured: true, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'mc8', title: 'Grilled Chicken', description: 'Tender chicken breast marinated in herbs and grilled to perfection.', price: 650, discount_price: null, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 520, cook_time: 18, stock: 25, featured: false, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'mc9', title: 'Noodles', description: 'Wok fried egg noodles tossed with scallions and mixed julienned veggies.', price: 280, discount_price: null, category_id: '2', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.5, calories: 480, cook_time: 10, stock: 40, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 1 },

  // 3. Bangladeshi Dishes
  { id: 'bd1', title: 'Kacchi Biryani', description: 'Traditional kacchi biryani with fragrant basmati and tender mutton.', price: 500, discount_price: 450, category_id: '3', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9, calories: 850, cook_time: 18, stock: 30, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 1 },
  { id: 'bd2', title: 'Tehari', description: 'Fragrant mustard-infused rice cooked with tender cubes of spiced beef.', price: 350, discount_price: null, category_id: '3', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 720, cook_time: 15, stock: 45, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 2 },
  { id: 'bd3', title: 'Chicken Curry', description: 'Home style chicken curry cooked with potatoes and local spices.', price: 280, discount_price: null, category_id: '3', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6, calories: 490, cook_time: 15, stock: 50, featured: false, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 2 },
  { id: 'bd4', title: 'Beef Curry', description: 'Rich, slow cooked beef curry with a thick aromatic gravy.', price: 380, discount_price: 350, category_id: '3', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9, calories: 580, cook_time: 20, stock: 40, featured: false, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 2 },
  { id: 'bd5', title: 'Mutton Curry', description: 'Tender mutton cooked in traditional bhuna masala and spices.', price: 480, discount_price: null, category_id: '3', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 620, cook_time: 20, stock: 25, featured: false, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 2 },
  { id: 'bd6', title: 'Polao', description: 'Aromatic chinigura rice cooked with ghee, raisins, and cardamoms.', price: 200, discount_price: null, category_id: '3', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6, calories: 400, cook_time: 10, stock: 50, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'bd7', title: 'Bhuna Khichuri', description: 'Lentils and rice cooked together in bhuna spices, rich and thick.', price: 320, discount_price: null, category_id: '3', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 550, cook_time: 15, stock: 35, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 1 },
  { id: 'bd8', title: 'Fish Curry', description: 'Fresh water Rui fish cooked in mustard paste gravy, traditional style.', price: 260, discount_price: 240, category_id: '3', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.5, calories: 380, cook_time: 12, stock: 30, featured: false, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 2 },

  // 4. Fast Food
  { id: 'ff1', title: 'Fried Chicken', description: 'Crispy, deep fried chicken pieces coated in seasoned flour.', price: 300, discount_price: 270, category_id: '4', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 480, cook_time: 12, stock: 60, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 1 },
  { id: 'ff2', title: 'Hot Dogs', description: 'Grilled chicken sausage in a soft bun topped with mustard sauce.', price: 220, discount_price: null, category_id: '4', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.4, calories: 390, cook_time: 8, stock: 50, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'ff3', title: 'Shawarma', description: 'Spiced chicken shavings wrapped in flatbread with garlic sauce.', price: 280, discount_price: null, category_id: '4', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 420, cook_time: 10, stock: 80, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 1 },
  { id: 'ff4', title: 'Wraps', description: 'Tortilla wrap filled with crispy chicken tenders and honey mustard.', price: 240, discount_price: null, category_id: '4', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.5, calories: 350, cook_time: 8, stock: 60, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 1 },
  { id: 'ff5', title: 'Club Sandwiches', description: 'Classic double decker bread sandwich filled with chicken and eggs.', price: 320, discount_price: 290, category_id: '4', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6, calories: 460, cook_time: 10, stock: 45, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },

  // 5. Seafood
  { id: 'sf1', title: 'Grilled Fish', description: 'Fresh red snapper fillet grilled with garlic butter and lemon.', price: 600, discount_price: 550, category_id: '5', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 420, cook_time: 15, stock: 20, featured: true, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'sf2', title: 'Fried Shrimp', description: 'Crispy breaded jumbo shrimps deep fried, served with tartar sauce.', price: 450, discount_price: null, category_id: '5', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 380, cook_time: 10, stock: 35, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'sf3', title: 'Prawns', description: 'Wok tossed fresh prawns in a garlic, butter and coriander sauce.', price: 550, discount_price: null, category_id: '5', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 320, cook_time: 12, stock: 25, featured: false, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 1 },
  { id: 'sf4', title: 'Crab', description: 'Whole crab cooked in local spicy tomato and chili masala paste.', price: 700, discount_price: null, category_id: '5', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9, calories: 350, cook_time: 18, stock: 15, featured: true, is_veg: false, is_vegan: false, is_gluten_free: true, spicy_level: 3 },

  // 6. Desserts
  { id: 'ds1', title: 'Ice Cream', description: 'Rich and creamy double scoop vanilla bean ice cream.', price: 150, discount_price: null, category_id: '6', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 250, cook_time: 3, stock: 100, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'ds2', title: 'Brownie', description: 'Warm, gooey chocolate fudge brownie loaded with walnuts.', price: 180, discount_price: null, category_id: '6', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 340, cook_time: 5, stock: 80, featured: false, is_veg: true, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'ds3', title: 'Cheesecake', description: 'Classic New York style baked cheesecake with a graham crust.', price: 255, discount_price: null, category_id: '6', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9, calories: 410, cook_time: 5, stock: 45, featured: true, is_veg: true, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'ds4', title: 'Gulab Jamun', description: 'Traditional sweet milk dumplings fried and soaked in sugar syrup.', price: 100, discount_price: null, category_id: '6', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 180, cook_time: 3, stock: 150, featured: false, is_veg: true, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: 'ds5', title: 'Firni', description: 'Creamy local ground rice pudding flavored with saffron and almonds.', price: 120, discount_price: null, category_id: '6', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6, calories: 200, cook_time: 5, stock: 70, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'ds6', title: 'Jorda', description: 'Sweet saffron rice cooked with nuts, raisins, and baby sweets.', price: 140, discount_price: null, category_id: '6', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 220, cook_time: 5, stock: 60, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },

  // 7. Drinks
  { id: 'dr1', title: 'Soft Drinks', description: 'Chilled carbonated soft drinks served in a glass with ice.', price: 50, discount_price: null, category_id: '7', image: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.2, calories: 140, cook_time: 2, stock: 200, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: 'dr2', title: 'Fresh Juice', description: 'Freshly squeezed pulp juice from sweet seasonal fruits.', price: 180, discount_price: 150, category_id: '7', image: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.8, calories: 120, cook_time: 5, stock: 120, featured: true, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: 'dr3', title: 'Premium Coffee', description: 'Rich freshly brewed hot black roast from premium espresso beans.', price: 150, discount_price: null, category_id: '7', image: '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', rating: 4.9, calories: 5, cook_time: 4, stock: 150, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: 'dr4', title: 'Aromatic Tea', description: 'Traditional spiced masala milk tea brewed with fresh cardamom.', price: 60, discount_price: null, category_id: '7', image: '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', rating: 4.6, calories: 10, cook_time: 3, stock: 300, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'dr5', title: 'Milkshake', description: 'Rich chocolate milkshake blended with milk and thick vanilla ice cream.', price: 220, discount_price: 200, category_id: '7', image: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.8, calories: 380, cook_time: 6, stock: 90, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'dr6', title: 'Smoothie', description: 'Chilled blend of fresh strawberries, bananas, and vanilla yogurt.', price: 240, discount_price: null, category_id: '7', image: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.7, calories: 280, cook_time: 6, stock: 80, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: 'dr7', title: 'Mocktails', description: 'Chilled mint mojito mocktail with fresh lime, mint, and club soda.', price: 260, discount_price: null, category_id: '7', image: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.9, calories: 150, cook_time: 5, stock: 75, featured: true, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [foods, setFoods] = useState<Food[]>(MOCK_FOODS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const { profile, isMockUser } = useAuth();

  // Load favorites & notifications from DB or localStorage
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: catData } = await supabase.from('categories').select('*');
        const { data: foodData } = await supabase.from('foods').select('*');

        if (catData && catData.length > 0) {
          setCategories(catData);
        }
        if (foodData && foodData.length > 0) {
          setFoods(foodData);
          setIsSupabaseConnected(true);
        }
      } catch (e) {
        console.warn('Supabase fetch failed in AppProvider. Operating on mock catalog.', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Local Storage Loading for mock environments
    const savedFavs = localStorage.getItem('flavor_haven_favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
    const savedRes = localStorage.getItem('flavor_haven_reservations');
    if (savedRes) {
      setReservations(JSON.parse(savedRes));
    }

    // Default mock notification
    setNotifications([
      {
        id: 'n1',
        user_id: profile?.id || 'mock-id',
        title: 'Welcome to Flavor Haven!',
        message: 'Thank you for choosing us. Check out today\'s special coffee discount!',
        read: false,
        created_at: new Date().toISOString(),
      },
    ]);
  }, [profile]);

  const toggleFavorite = (foodId: string) => {
    setFavorites((prev) => {
      let updated: string[];
      if (prev.includes(foodId)) {
        updated = prev.filter((id) => id !== foodId);
      } else {
        updated = [...prev, foodId];
      }
      localStorage.setItem('flavor_haven_favorites', JSON.stringify(updated));

      // Handle DB sync
      if (!isMockUser && profile) {
        if (prev.includes(foodId)) {
          supabase.from('favorites').delete().eq('user_id', profile.id).eq('food_id', foodId).then();
        } else {
          supabase.from('favorites').insert([{ user_id: profile.id, food_id: foodId }]).then();
        }
      }
      return updated;
    });
  };

  const isFavorite = (foodId: string) => favorites.includes(foodId);

  const addNotification = (title: string, message: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      user_id: profile?.id || 'mock-id',
      title,
      message,
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const createReservation = async (
    name: string,
    phone: string,
    guests: number,
    date: string,
    time: string
  ): Promise<boolean> => {
    const resId = `res-${Date.now()}`;
    const newRes: Reservation = {
      id: resId,
      user_id: profile?.id || null,
      name,
      phone,
      guests,
      date,
      time,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    try {
      if (!isMockUser && profile) {
        const { error } = await supabase.from('reservations').insert([
          {
            user_id: profile.id,
            name,
            phone,
            guests,
            date,
            time,
          },
        ]);
        if (error) throw error;
      }
      
      const updatedRes = [newRes, ...reservations];
      setReservations(updatedRes);
      localStorage.setItem('flavor_haven_reservations', JSON.stringify(updatedRes));
      addNotification('Reservation Requested', `Booking request for ${guests} guests on ${date} at ${time} is pending confirmation.`);
      return true;
    } catch (e) {
      console.warn('DB reservation failed. Placing local reservation.', e);
      const updatedRes = [newRes, ...reservations];
      setReservations(updatedRes);
      localStorage.setItem('flavor_haven_reservations', JSON.stringify(updatedRes));
      return true;
    }
  };

  const getReservations = () => reservations;

  return (
    <AppContext.Provider
      value={{
        foods,
        categories,
        favorites,
        notifications,
        loading,
        isSupabaseConnected,
        toggleFavorite,
        isFavorite,
        addNotification,
        markNotificationsAsRead,
        createReservation,
        getReservations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
