'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string) => Promise<boolean>; // compatibility fallback
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  updatePoints: (pointsToAdd: number) => void;
  toggleMockRole: () => void; // switches mock user role (customer/admin)
  toggleMockAuthMode: () => void; // switches between Live and Mock auth modes
  isMockUser: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockUser, setIsMockUser] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Automatically read query parameters to open Auth Modal on redirection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openAuth') === 'true') {
        setIsAuthModalOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // Initialize live session
  useEffect(() => {
    async function checkUser() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && data) {
            setProfile(data);
          } else {
            // Create profile record if missing
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
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Supabase Auth connection error:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  // Listen to auth state changes
  useEffect(() => {

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setProfile(data);
        } else {
          // If profile is not found, it might be in progress of creation, wait or set defaults
          setProfile({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || 'Valued Patron',
            email: session.user.email || '',
            phone: null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            role: 'customer',
            reward_points: 100,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isMockUser]);

  // Compatibility fallback signIn
  const signIn = async (email: string): Promise<boolean> => {
    const res = await signInWithOtp(email);
    return res.success;
  };

  // Live Mode: Sign In with Password
  const signInWithPassword = async (email: string, password: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during sign in.' };
    } finally {
      setLoading(false);
    }
  };

  // Live Mode: Sign In with OTP / Magic Link
  const signInWithOtp = async (email: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        }
      });
      if (error) throw error;

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred sending the magic link.' };
    } finally {
      setLoading(false);
    }
  };

  // Live Mode: Sign Up
  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      if (error) throw error;

      // Create a profile record manually after signUp succeeds
      if (data.user) {
        const newProfile = {
          id: data.user.id,
          name,
          email,
          role: 'customer',
          reward_points: 100, // Starting point bonus
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([newProfile]);
          
        if (profileError) {
          console.warn('Could not insert profile record directly, might create on state change check.', profileError);
        }
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during registration.' };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setProfile(null);
    } catch (err) {
      console.error('Error signing out', err);
    } finally {
      setLoading(false);
    }
  };

  // Update Points in local context & Supabase
  const updatePoints = (pointsToAdd: number) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, reward_points: prev.reward_points + pointsToAdd };
      supabase
        .from('profiles')
        .update({ reward_points: updated.reward_points })
        .eq('id', prev.id)
        .then();
      return updated;
    });
  };

  // Toggle Mock Roles (Disabled)
  const toggleMockRole = () => {
    console.log('Mock role toggling is disabled.');
  };

  // Toggle between Mock and Live Mode (Disabled)
  const toggleMockAuthMode = () => {
    console.log('Mock Auth Mode has been permanently removed.');
  };

  return (
    <AuthContext.Provider value={{
      profile,
      loading,
      signIn,
      signInWithPassword,
      signInWithOtp,
      signUp,
      signOut,
      updatePoints,
      toggleMockRole,
      toggleMockAuthMode,
      isMockUser,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal
    }}>
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

