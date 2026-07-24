'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/navbar';
import { User, ShoppingBag, Heart, Award, Calendar, RefreshCw, Key, ShieldCheck, Mail, Phone, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/types';

export default function UserDashboardPage() {
  const { profile, toggleMockRole, isMockUser } = useAuth();
  const { foods, favorites, toggleFavorite, getReservations } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'points' | 'reservations'>('profile');

  // Load Order History
  useEffect(() => {
    // Fallback load mock local order history
    const history = JSON.parse(localStorage.getItem('flavor_haven_orders') || '[]');
    setOrders(history);
  }, []);

  // Load active tab from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'orders' || tab === 'wishlist' || tab === 'points' || tab === 'reservations' || tab === 'profile') {
        setActiveTab(tab as any);
      }
    }
  }, []);

  if (!profile) return null;

  // Filter wishlisted food objects
  const wishlistedFoods = foods.filter((f) => favorites.includes(f.id));
  const reservations = getReservations();

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-[#f0fdf4]">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={0}
        onCartOpen={() => {}}
        hideCategories={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header Title */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Your Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage orders, redeem rewards, and review reservations.</p>
          </div>
          {/* Quick role-switch tool for testing admin panels */}
          <div className="flex gap-2 bg-white/70 border border-emerald-100/50 p-2 rounded-2xl shadow-sm">
            <button
              onClick={toggleMockRole}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Switch to {profile.role === 'customer' ? 'Admin' : 'Customer'} Panel</span>
            </button>
            {profile.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-brand-medium hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Go to Admin Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Order History ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <Heart className="h-5 w-5" />
              <span>My Wishlist ({wishlistedFoods.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('points')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'points'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <Award className="h-5 w-5" />
              <span>Loyalty Points ({profile.reward_points})</span>
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'reservations'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>Reservations ({reservations.length})</span>
            </button>
          </div>

          {/* Details Content Box */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-brand-medium/10 border border-brand-medium/35 text-brand-medium flex items-center justify-center font-extrabold text-2xl">
                    {profile.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">{profile.name}</h3>
                    <p className="text-xs text-slate-500 font-medium capitalize">
                      Account Type: {profile.role} (Mock status)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> Email Address
                    </span>
                    <p className="text-sm font-extrabold text-slate-850">{profile.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> Mobile Phone
                    </span>
                    <p className="text-sm font-extrabold text-slate-850">
                      {profile.phone || '+880 1712-345678 (placeholder)'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Orders History Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="glass-panel rounded-3xl p-8 border border-emerald-100/50 bg-white/40 text-center text-slate-400">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-slate-350" />
                    <p className="font-bold text-slate-800">No order history found</p>
                    <p className="text-xs mt-1">Place your first order and track it here!</p>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="glass-panel rounded-2xl p-5 border border-emerald-100/50 bg-white/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-100 transition-colors"
                    >
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Order ID: #{ord.id.substring(0, 15)}...</h4>
                        <p className="text-xs text-slate-450 mt-1">
                          Placed on: {new Date(ord.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-bold text-brand-medium mt-1">Total Paid: {ord.total} Tk</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : ord.status === 'cancelled'
                            ? 'bg-rose-50 border-rose-100 text-rose-700'
                            : 'bg-amber-50 border-amber-100 text-amber-700'
                        }`}>
                          {ord.status}
                        </span>
                        <Link
                          href={`/orders/${ord.id}`}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Track Live
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistedFoods.length === 0 ? (
                  <div className="col-span-2 glass-panel rounded-3xl p-8 border border-emerald-100/50 bg-white/40 text-center text-slate-400">
                    <Heart className="h-10 w-10 mx-auto mb-3 text-slate-350" />
                    <p className="font-bold text-slate-800">Your wishlist is empty</p>
                    <p className="text-xs mt-1">Browse foods and favorite items to track them here.</p>
                  </div>
                ) : (
                  wishlistedFoods.map((food) => (
                    <div
                      key={food.id}
                      className="glass-panel rounded-2xl p-4 border border-emerald-100/50 bg-white/40 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={food.image || '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg'}
                          alt={food.title}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                        />
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800 truncate max-w-[120px]">
                            {food.title}
                          </h4>
                          <p className="text-xs text-brand-medium font-bold">
                            {food.discount_price || food.price} Tk
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/menu/${food.id}`}
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-650 cursor-pointer"
                          title="View detail"
                        >
                          👁️
                        </Link>
                        <button
                          onClick={() => toggleFavorite(food.id)}
                          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 cursor-pointer"
                          title="Remove favorite"
                        >
                          <Heart className="h-4.5 w-4.5 fill-rose-500 text-rose-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Loyalty Points Tab */}
            {activeTab === 'points' && (
              <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm space-y-6">
                <div className="p-5 bg-gradient-to-r from-brand-medium to-emerald-600 rounded-2xl text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Accumulated Balance</p>
                    <p className="text-4xl font-extrabold mt-1">{profile.reward_points} Points</p>
                  </div>
                  <span className="text-4xl">👑</span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Redeem Rewards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">Free Special Coffee</p>
                        <p className="text-xs text-slate-500 mt-0.5">Required: 150 Points</p>
                      </div>
                      <button
                        disabled={profile.reward_points < 150}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Claim Reward
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">Free Special Burger</p>
                        <p className="text-xs text-slate-500 mt-0.5">Required: 350 Points</p>
                      </div>
                      <button
                        disabled={profile.reward_points < 350}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Claim Reward
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div className="space-y-4">
                {reservations.length === 0 ? (
                  <div className="glass-panel rounded-3xl p-8 border border-emerald-100/50 bg-white/40 text-center text-slate-400">
                    <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-350" />
                    <p className="font-bold text-slate-800">No table bookings registered</p>
                    <p className="text-xs mt-1">Book a cozy dining table in the About/Contact pages!</p>
                  </div>
                ) : (
                  reservations.map((res) => (
                    <div
                      key={res.id}
                      className="glass-panel rounded-2xl p-5 border border-emerald-100/50 bg-white/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-brand-medium rounded-xl">
                          <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">Table booking for {res.guests} guests</h4>
                          <p className="text-xs text-slate-450 mt-1">
                            Scheduled on: {res.date} at {res.time}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Contact: {res.phone}</p>
                        </div>
                      </div>

                      <div>
                        <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border ${
                          res.status === 'confirmed'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-amber-50 border-amber-100 text-amber-700'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
