'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/navbar';
import { ShieldAlert, RefreshCw, BarChart3, TrendingUp, DollarSign, ShoppingBag, Calendar, Users, Key, Utensils, ClipboardList, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, Reservation } from '@/types';
import { supabase } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { getReservations } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Client-side route guard: Redirect guest to homepage and pop Auth Modal
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/?openAuth=true&redirect=/admin');
    }
  }, [profile, authLoading, router]);

  // Fetch data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load orders
        let loadedOrders: Order[] = [];
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          loadedOrders = data;
        } else {
          loadedOrders = JSON.parse(localStorage.getItem('flavor_haven_orders') || '[]');
        }
        setOrders(loadedOrders);

        // Load reservations
        setReservations(getReservations());

        // Load registered users count
        const { count, error: userCountError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (!userCountError && count !== null) {
          setRegisteredUsersCount(count);
        } else {
          setRegisteredUsersCount(0);
        }

        // Load total reviews count
        const { count: revCount, error: revCountError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });
        if (!revCountError && revCount !== null) {
          setReviewsCount(revCount);
        } else {
          setReviewsCount(0);
        }
      } catch (e) {
        console.error('Error fetching admin data', e);
      } finally {
        setLoading(false);
      }
    }
    if (profile?.role === 'admin') {
      loadData();
    }
  }, [profile, getReservations]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#f0fdf4]">
        <RefreshCw className="h-8 w-8 text-brand-medium animate-spin" />
        <p className="text-xs font-bold text-slate-500 mt-3">Verifying privileges...</p>
      </div>
    );
  }

  // Security gate
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4 bg-[#f0fdf4]">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">
          You need Admin privileges to view this management console. (Currently signed in as: {profile?.role || 'Guest'})
        </p>
        <div className="flex gap-3 mt-6">
          <Link href="/" className="px-5 py-2.5 bg-brand-medium text-white font-bold rounded-xl text-xs cursor-pointer">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Math for stats
  const totalRevenue = orders.reduce((acc, o) => (o.status !== 'cancelled' ? acc + o.total : acc), 0);
  const pendingOrders = orders.filter((o) => o.status === 'received' || o.status === 'preparing' || o.status === 'cooking').length;
  const pendingRes = reservations.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-[#f0fdf4]">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={0}
        onCartOpen={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Title / Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Key className="h-8 w-8 text-brand-medium" />
              <span>Admin Console</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Flavor Haven Business Metrics & Operational Controls.</p>
          </div>
          
          {/* Sub Navigation links */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/foods"
              className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Utensils className="h-4 w-4 text-brand-medium" />
              <span>Menu Items</span>
            </Link>
            <Link
              href="/admin/categories"
              className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Utensils className="h-4 w-4 text-amber-500" />
              <span>Categories</span>
            </Link>
            <Link
              href="/admin/orders"
              className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ClipboardList className="h-4 w-4 text-blue-500" />
              <span>Live Orders</span>
            </Link>
            <Link
              href="/admin/reviews"
              className="px-3.5 py-2.5 bg-brand-medium hover:bg-emerald-755 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow shadow-brand-medium/10 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Review Moderation</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Revenue */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-brand-medium rounded-2xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Revenue</p>
              <p className="text-2xl font-extrabold text-slate-800">{totalRevenue} Tk</p>
            </div>
          </div>

          {/* Active Orders */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Orders</p>
              <p className="text-2xl font-extrabold text-slate-800">{pendingOrders} Active</p>
            </div>
          </div>

          {/* Active Reservations */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Reservations</p>
              <p className="text-2xl font-extrabold text-slate-800">{pendingRes} Bookings</p>
            </div>
          </div>

          {/* Users */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Users</p>
              <p className="text-2xl font-extrabold text-slate-800">{registeredUsersCount} Accounts</p>
            </div>
          </div>

          {/* Reviews */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Reviews</p>
              <p className="text-2xl font-extrabold text-slate-800">{reviewsCount} Feedbacks</p>
            </div>
          </div>
        </div>

        {/* Analytics charts placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue line chart mockup */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <BarChart3 className="h-4.5 w-4.5 text-brand-medium" />
              <span>Sales & Income Analytics</span>
            </h3>
            
            {/* Mock chart illustration */}
            <div className="h-[220px] flex items-end justify-between gap-2.5 pt-6 px-4">
              {[
                { m: 'Jan', val: 40 },
                { m: 'Feb', val: 55 },
                { m: 'Mar', val: 48 },
                { m: 'Apr', val: 70 },
                { m: 'May', val: 85 },
                { m: 'Jun', val: 92 },
              ].map((month) => (
                <div key={month.m} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-450 opacity-0 group-hover:opacity-100 transition-opacity">
                    {month.val}k
                  </span>
                  <div
                    className="w-full bg-brand-medium/20 group-hover:bg-brand-medium rounded-t-lg transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${month.val * 1.8}px` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{month.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular categories circular stats mockup */}
          <div className="lg:col-span-1 glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <TrendingUp className="h-4.5 w-4.5 text-brand-medium" />
              <span>Category Share</span>
            </h3>

            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Burgers 🍔</span>
                  <span>45%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-medium rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Drinks 🍹</span>
                  <span>35%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Coffee 🍵</span>
                  <span>20%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Table Reservations Log */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            Pending Table Reservations Booking Log ({pendingRes})
          </h3>

          {reservations.length === 0 ? (
            <p className="text-xs text-slate-450 py-4 text-center">No reservations active.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Recipient</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Guests</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reservations.map((res) => (
                    <tr key={res.id}>
                      <td className="py-3.5 font-bold text-slate-800">{res.name}</td>
                      <td className="py-3.5">{res.phone}</td>
                      <td className="py-3.5 font-extrabold">{res.guests} Guests</td>
                      <td className="py-3.5">{res.date}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{res.time}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          res.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
