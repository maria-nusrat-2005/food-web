'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/navbar';
import CartDrawer from '@/components/cart-drawer';
import { Calendar, Users, Clock, CalendarCheck, Phone, User, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Reservation } from '@/types';

export default function MyReservationsPage() {
  const { profile, isMockUser } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true);
        if (!isMockUser && profile) {
          const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('user_id', profile.id)
            .order('date', { ascending: false });

          if (error) throw error;
          if (data && data.length > 0) {
            setReservations(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load reservations from Supabase. Falling back to local storage.', err);
      }

      // Local storage fallback
      const localRes = JSON.parse(localStorage.getItem('flavor_haven_reservations') || '[]');
      localRes.sort((a: any, b: any) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
      setReservations(localRes);
      setLoading(false);
    }

    loadReservations();
  }, [profile, isMockUser]);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-150', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-150', icon: XCircle };
      case 'pending':
      default:
        return { label: 'Pending Confirmation', color: 'bg-amber-50 text-amber-700 border-amber-150', icon: AlertCircle };
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col font-sans">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
        hideCategories={true}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4A017] mb-2 block">
            Table Bookings
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            My Reservations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            View your table bookings, reservations status, and check dining requests.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#166534] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs mt-4 font-medium">Retrieving reservations...</p>
          </div>
        ) : !profile ? (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Account Access Required</h3>
            <p className="text-slate-550 text-xs mt-2 mb-6">
              Please sign in to your Flavor Haven account to view your reservations.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#166534] hover:bg-[#114f29] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-[#166534]/10"
            >
              Go to Account Panel
            </Link>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto">
            <div className="h-16 w-16 bg-[#FFFDF8] rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-50">
              <CalendarCheck className="h-8 w-8 text-[#D4A017]" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">No Reservations Yet</h3>
            <p className="text-slate-555 text-xs mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
              You haven't requested any table bookings yet. Host a dinner or secure your spot today.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#166534] hover:bg-[#114f29] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Book a Table
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reservations.map((res) => {
              const statusConfig = getStatusConfig(res.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={res.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Booking Header */}
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${statusConfig.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        ID: {res.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    {/* Booking details */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-xs text-slate-650 font-semibold">
                        <Calendar className="h-4 w-4 text-[#D4A017] shrink-0" />
                        <span>Date: {res.date}</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-slate-650 font-semibold">
                        <Clock className="h-4 w-4 text-[#D4A017] shrink-0" />
                        <span>Time: {res.time}</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-slate-650 font-semibold">
                        <Users className="h-4 w-4 text-[#D4A017] shrink-0" />
                        <span>Guests: {res.guests} people</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-slate-655 font-semibold">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>Name: {res.name}</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-slate-655 font-semibold">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>Phone: {res.phone}</span>
                      </div>
                    </div>
                  </div>

                  {res.status.toLowerCase() === 'pending' && (
                    <div className="mt-4 pt-3 border-t border-slate-100/50 flex justify-end">
                      <p className="text-[10px] text-slate-400 italic">We will notify you via call or email once confirmed.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-10 border-t border-slate-150 bg-white/30 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🥘</span>
            <span className="font-extrabold text-slate-800 text-sm">Flavor Haven</span>
          </div>
          <p>© {new Date().getFullYear()} Flavor Haven Restaurant Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-brand-medium transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-brand-medium transition-colors">Contact Support</Link>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-medium transition-colors">Find Us on Map</a>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
}
