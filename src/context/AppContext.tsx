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
  refreshFoods: () => Promise<void>;
  refreshCategories: () => Promise<void>;
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

const MOCK_FOODS: Food[] = [];

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

  const refreshFoods = async () => {
    try {
      const { data: foodData } = await supabase.from('foods').select('*');
      if (foodData) {
        setFoods(foodData);
      }
    } catch (err) {
      console.error('Error refreshing foods catalog:', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) {
        setCategories(catData);
      }
    } catch (err) {
      console.error('Error refreshing categories:', err);
    }
  };

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
        refreshFoods,
        refreshCategories,
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
