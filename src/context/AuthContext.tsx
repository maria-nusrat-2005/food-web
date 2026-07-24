'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updatePoints: (pointsToAdd: number) => void;
  toggleMockRole: () => void; // Utility to switch between customer & admin roles for testing
  isMockUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_CUSTOMER_PROFILE: Profile = {
  id: 'mock-customer-id',
  name: 'Maria Nusrat',
  email: 'maria@example.com',
  phone: '+880 1712-345678',
  avatar_url: '/Image/avatar.png',
  role: 'customer',
  reward_points: 350,
};

const MOCK_ADMIN_PROFILE: Profile = {
  id: 'mock-admin-id',
  name: 'Chef Admin',
  email: 'admin@flavorhaven.com',
  phone: '+880 1987-654321',
  avatar_url: '/Image/avatar.png',
  role: 'admin',
  reward_points: 0,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(MOCK_CUSTOMER_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isMockUser, setIsMockUser] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Attempt to fetch profile from DB
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && data) {
            setProfile(data);
            setIsMockUser(false);
          } else {
            // If user exists in auth but profile record is missing, create it
            const newProfile: Profile = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 'Valued Patron',
              email: session.user.email || '',
              phone: null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              role: 'customer',
              reward_points: 100, // starting points bonus
            };
            
            await supabase.from('profiles').insert([
              {
                id: newProfile.id,
                name: newProfile.name,
                email: newProfile.email,
                role: newProfile.role,
                reward_points: newProfile.reward_points
              }
            ]);
            setProfile(newProfile);
            setIsMockUser(false);
          }
        } else {
          // Default to mock customer profile for testing ease
          setProfile(MOCK_CUSTOMER_PROFILE);
          setIsMockUser(true);
        }
      } catch (err) {
        console.warn('Supabase Auth error. Defaulting to mock profiles.', err);
        setProfile(MOCK_CUSTOMER_PROFILE);
        setIsMockUser(true);
      } finally {
        setLoading(false);
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setProfile(data);
          setIsMockUser(false);
        }
      } else {
        setProfile(MOCK_CUSTOMER_PROFILE);
        setIsMockUser(true);
      }
    });

    checkUser();
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string): Promise<boolean> => {
    try {
      // For local mockup testing, check if email has 'admin' in it
      if (email.includes('admin')) {
        setProfile(MOCK_ADMIN_PROFILE);
        setIsMockUser(true);
        return true;
      } else if (email.includes('customer') || email.includes('@')) {
        setProfile(MOCK_CUSTOMER_PROFILE);
        setIsMockUser(true);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const signOut = async () => {
    if (!isMockUser) {
      await supabase.auth.signOut();
    }
    setProfile(null);
  };

  const updatePoints = (pointsToAdd: number) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, reward_points: prev.reward_points + pointsToAdd };
      if (!isMockUser) {
        supabase
          .from('profiles')
          .update({ reward_points: updated.reward_points })
          .eq('id', prev.id)
          .then();
      }
      return updated;
    });
  };

  const toggleMockRole = () => {
    setProfile((prev) => {
      if (!prev) return MOCK_CUSTOMER_PROFILE;
      return prev.role === 'customer' ? MOCK_ADMIN_PROFILE : MOCK_CUSTOMER_PROFILE;
    });
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signOut, updatePoints, toggleMockRole, isMockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
