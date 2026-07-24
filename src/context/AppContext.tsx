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
  { id: '1', name: 'burger', icon: 'Pizza' },
  { id: '2', name: 'drinks', icon: 'Wine' },
  { id: '3', name: 'coffee', icon: 'Coffee' },
];

const MOCK_FOODS: Food[] = [
  { id: '1', title: 'Our Special Burger', description: 'Juicy grilled burger with fresh lettuce, tomatoes, cheese, and our special sauce.', price: 900, discount_price: 750, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9, calories: 650, cook_time: 15, stock: 45, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 1 },
  { id: '2', title: 'Chicken Burger', description: 'Juicy grilled chicken burger with fresh lettuce, tomatoes, cheese, and mild herb sauce.', price: 600, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7, calories: 580, cook_time: 12, stock: 50, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: '3', title: 'Chicken Cheese Burger', description: 'Grilled chicken patty with extra melted cheddar cheese, pickles, and our signature sauce.', price: 600, discount_price: 550, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 620, cook_time: 12, stock: 35, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: '4', title: 'Cheese Burger', description: 'Classic beef patty burger loaded with double layers of melted cheese, lettuce, and pickles.', price: 600, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6, calories: 610, cook_time: 10, stock: 40, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: '5', title: 'Student Special Burger', description: 'Delicious budget-friendly grilled chicken burger customized for students.', price: 150, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.5, calories: 450, cook_time: 8, stock: 100, featured: false, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: '6', title: 'Beef Burger', description: 'Premium ground beef patty grilled to order, with fresh onion rings, cheddar, and BBQ glaze.', price: 600, discount_price: 500, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8, calories: 680, cook_time: 15, stock: 30, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 0 },
  { id: '7', title: 'Vegetable Burger', description: 'Healthy plant-based patty with fresh garden greens, tomatoes, and vegan garlic aioli.', price: 200, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.4, calories: 380, cook_time: 10, stock: 25, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: '8', title: 'Beef Naga Burger', description: 'Super spicy beef burger loaded with extremely hot Bangladeshi Naga chili paste and cheese.', price: 520, discount_price: null, category_id: '1', image: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9, calories: 700, cook_time: 15, stock: 20, featured: true, is_veg: false, is_vegan: false, is_gluten_free: false, spicy_level: 3 },
  { id: '9', title: 'Orange Juice', description: 'Freshly squeezed sweet orange juice full of natural pulp and vitamin C.', price: 180, discount_price: 150, category_id: '2', image: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.7, calories: 120, cook_time: 5, stock: 60, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: '10', title: 'Papaya Juice', description: 'Creamy sweet papaya juice, served fresh and chilled.', price: 100, discount_price: null, category_id: '2', image: '/Image/olivier-guillard-AjG1BkDH4Zs-unsplash.jpg', rating: 4.5, calories: 140, cook_time: 5, stock: 40, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: '11', title: 'Watermelon Juice', description: 'Freshly blended refreshing watermelon juice, perfect for hot summer days.', price: 200, discount_price: 170, category_id: '2', image: '/Image/rohollah-saberi-21QZGQKpOYE-unsplash.jpg', rating: 4.8, calories: 90, cook_time: 4, stock: 80, featured: true, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: '12', title: 'Special Orange Juice', description: 'Zesty signature orange juice blended with dynamic citrus ingredients.', price: 250, discount_price: null, category_id: '2', image: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.9, calories: 130, cook_time: 5, stock: 50, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: '13', title: 'Cappuccino', description: 'Authentic espresso base layered with steaming milk and rich, velvety milk foam.', price: 300, discount_price: 260, category_id: '3', image: '/Image/nathan-dumlao-zUNs99PGDg0-unsplash.jpg', rating: 4.9, calories: 150, cook_time: 6, stock: 90, featured: true, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: '14', title: 'Hot Coffee', description: 'Freshly brewed aromatic coffee, served steaming hot.', price: 100, discount_price: null, category_id: '3', image: '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', rating: 4.5, calories: 5, cook_time: 3, stock: 200, featured: false, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
  { id: '15', title: 'Iced Coffee', description: 'Chilled espresso poured over ice and finished with cream.', price: 180, discount_price: null, category_id: '3', image: '/Image/nathan-dumlao-vZOZJH_xkUk-unsplash.jpg', rating: 4.7, calories: 180, cook_time: 4, stock: 150, featured: false, is_veg: true, is_vegan: false, is_gluten_free: true, spicy_level: 0 },
  { id: '16', title: 'Our Special Coffee', description: 'Classic rich roast coffee brewed from house-roasted special organic beans.', price: 180, discount_price: 160, category_id: '3', image: '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', rating: 4.8, calories: 10, cook_time: 5, stock: 120, featured: true, is_veg: true, is_vegan: true, is_gluten_free: true, spicy_level: 0 },
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
            id: resId,
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
